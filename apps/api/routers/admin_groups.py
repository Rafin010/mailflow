from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import Group, GroupMember, GroupAccess, GroupMemberRole, User
from ..deps import require_admin, parse_uuid
from ..audit import log_action
from ..addressing import require_org_address
from ..schemas import group_out, user_out

router = APIRouter(prefix="/groups", tags=["Admin: Groups"])


class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str
    description: Optional[str] = Field(default=None, max_length=1000)
    access_level: GroupAccess = GroupAccess.ORGANIZATION
    member_ids: list[str] = []


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    access_level: Optional[GroupAccess] = None


class MembersAdd(BaseModel):
    user_ids: list[str]
    role: GroupMemberRole = GroupMemberRole.MEMBER


class MemberRoleUpdate(BaseModel):
    role: GroupMemberRole


async def _get_group(db: AsyncSession, admin: User, group_id: str) -> Group:
    group = (await db.execute(
        select(Group).options(selectinload(Group.members).selectinload(GroupMember.user))
        .where(Group.id == parse_uuid(group_id, "group id"), Group.organization_id == admin.organization_id)
    )).scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


async def _org_users(db: AsyncSession, admin: User, ids: list[str]) -> list[User]:
    uuids = [parse_uuid(i, "user id") for i in ids]
    if not uuids:
        return []
    users = (await db.execute(
        select(User).where(User.id.in_(uuids), User.organization_id == admin.organization_id)
    )).scalars().all()
    if len(users) != len(set(uuids)):
        raise HTTPException(status_code=400, detail="One or more users were not found in your organization")
    return users


def _group_detail(group: Group) -> dict:
    data = group_out(group, len(group.members))
    data["members"] = [
        {**user_out(m.user), "membership_id": str(m.id), "group_role": m.role.value}
        for m in sorted(group.members, key=lambda m: (m.role != GroupMemberRole.MODERATOR, m.user.email))
    ]
    return data


@router.get("")
async def list_groups(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(Group, func.count(GroupMember.id))
        .outerjoin(GroupMember, GroupMember.group_id == Group.id)
        .where(Group.organization_id == admin.organization_id)
        .group_by(Group.id).order_by(Group.name)
    )).all()
    return [group_out(g, count) for g, count in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_group(body: GroupCreate, request: Request,
                       admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    email = await require_org_address(db, admin.organization_id, body.email)
    members = await _org_users(db, admin, body.member_ids)
    group = Group(organization_id=admin.organization_id, name=body.name.strip(), email=email,
                  description=body.description, access_level=body.access_level)
    db.add(group)
    await db.flush()
    for u in members:
        db.add(GroupMember(group_id=group.id, user_id=u.id))
    log_action(db, admin, "group.create", target_type="group", target_id=group.id, target_label=email,
               details={"members": len(members)}, request=request)
    await db.commit()
    return _group_detail(await _get_group(db, admin, str(group.id)))


@router.get("/{group_id}")
async def get_group(group_id: str, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return _group_detail(await _get_group(db, admin, group_id))


@router.patch("/{group_id}")
async def update_group(group_id: str, body: GroupUpdate, request: Request,
                       admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    group = await _get_group(db, admin, group_id)
    changes = body.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(group, key, value)
    log_action(db, admin, "group.update", target_type="group", target_id=group.id, target_label=group.email,
               details={"fields": list(changes.keys())}, request=request)
    await db.commit()
    return _group_detail(await _get_group(db, admin, group_id))


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(group_id: str, request: Request,
                       admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    group = await _get_group(db, admin, group_id)
    log_action(db, admin, "group.delete", target_type="group", target_id=group.id, target_label=group.email,
               request=request)
    await db.delete(group)
    await db.commit()


@router.post("/{group_id}/members")
async def add_members(group_id: str, body: MembersAdd, request: Request,
                      admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    group = await _get_group(db, admin, group_id)
    existing = {m.user_id for m in group.members}
    users = await _org_users(db, admin, body.user_ids)
    added = [u for u in users if u.id not in existing]
    for u in added:
        db.add(GroupMember(group_id=group.id, user_id=u.id, role=body.role))
    if added:
        log_action(db, admin, "group.members_add", target_type="group", target_id=group.id, target_label=group.email,
                   details={"users": [u.email for u in added]}, request=request)
    await db.commit()
    db.expire_all()
    return _group_detail(await _get_group(db, admin, group_id))


@router.patch("/{group_id}/members/{membership_id}")
async def update_member(group_id: str, membership_id: str, body: MemberRoleUpdate, request: Request,
                        admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    group = await _get_group(db, admin, group_id)
    member = next((m for m in group.members if str(m.id) == membership_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    member.role = body.role
    log_action(db, admin, "group.member_role", target_type="group", target_id=group.id, target_label=group.email,
               details={"user": member.user.email, "role": body.role.value}, request=request)
    await db.commit()
    db.expire_all()
    return _group_detail(await _get_group(db, admin, group_id))


@router.delete("/{group_id}/members/{membership_id}")
async def remove_member(group_id: str, membership_id: str, request: Request,
                        admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    group = await _get_group(db, admin, group_id)
    member = next((m for m in group.members if str(m.id) == membership_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    log_action(db, admin, "group.member_remove", target_type="group", target_id=group.id, target_label=group.email,
               details={"user": member.user.email}, request=request)
    await db.delete(member)
    await db.commit()
    db.expire_all()
    return _group_detail(await _get_group(db, admin, group_id))
