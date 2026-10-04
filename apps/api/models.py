import uuid
import enum
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Enum, Integer, Text, Uuid, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from .database import Base


def utcnow():
    return datetime.utcnow()


class BillingPlan(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MEMBER = "member"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"


class GroupAccess(str, enum.Enum):
    PUBLIC = "public"              # anyone (incl. external) can email the group
    ORGANIZATION = "organization"  # only org members
    MEMBERS_ONLY = "members_only"  # only group members


class GroupMemberRole(str, enum.Enum):
    MEMBER = "member"
    MODERATOR = "moderator"


class FilterRuleType(str, enum.Enum):
    ALLOW = "allow"
    BLOCK = "block"


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    billing_plan = Column(Enum(BillingPlan), default=BillingPlan.FREE)
    created_at = Column(DateTime, default=utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    domains = relationship("Domain", back_populates="organization", cascade="all, delete-orphan")
    mailboxes = relationship("Mailbox", back_populates="organization", cascade="all, delete-orphan")
    groups = relationship("Group", back_populates="organization", cascade="all, delete-orphan")
    policy = relationship("OrgPolicy", back_populates="organization", uselist=False, cascade="all, delete-orphan")


class Domain(Base):
    __tablename__ = "domains"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False, index=True)
    domain_name = Column(String, unique=True, index=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_primary = Column(Boolean, default=False)
    verification_token = Column(String, nullable=False)

    # DNS health: "ok" | "missing" | "invalid" | "pending"
    mx_status = Column(String, default="pending")
    spf_status = Column(String, default="pending")
    dkim_status = Column(String, default="pending")
    dmarc_status = Column(String, default="pending")

    dkim_selector = Column(String, default="mailflow")
    dkim_public_key = Column(Text, nullable=True)
    dkim_private_key = Column(Text, nullable=True)

    catch_all_address = Column(String, nullable=True)
    last_checked_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    organization = relationship("Organization", back_populates="domains")


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    avatar_url = Column(Text, nullable=True)

    role = Column(Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    is_active = Column(Boolean, default=True)  # kept for backward compatibility

    storage_quota_mb = Column(Integer, default=5120)
    storage_used_mb = Column(Integer, default=0)

    recovery_email = Column(String, nullable=True)
    recovery_phone = Column(String, nullable=True)
    mfa_enabled = Column(Boolean, default=False)

    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    organization = relationship("Organization", back_populates="users")
    aliases = relationship("EmailAlias", back_populates="user", cascade="all, delete-orphan")
    group_memberships = relationship("GroupMember", back_populates="user", cascade="all, delete-orphan")


class EmailAlias(Base):
    __tablename__ = "email_aliases"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    address = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="aliases")


class Group(Base):
    __tablename__ = "groups"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    access_level = Column(Enum(GroupAccess), default=GroupAccess.ORGANIZATION, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    organization = relationship("Organization", back_populates="groups")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (UniqueConstraint("group_id", "user_id", name="uq_group_member"),)

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    group_id = Column(Uuid, ForeignKey("groups.id"), nullable=False, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(Enum(GroupMemberRole), default=GroupMemberRole.MEMBER, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")


class OrgPolicy(Base):
    __tablename__ = "org_policies"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id"), unique=True, nullable=False)
    password_min_length = Column(Integer, default=8)
    password_require_uppercase = Column(Boolean, default=True)
    password_require_number = Column(Boolean, default=True)
    password_require_symbol = Column(Boolean, default=False)
    enforce_mfa = Column(Boolean, default=False)
    session_timeout_minutes = Column(Integer, default=60 * 24)
    allow_external_forwarding = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    organization = relationship("Organization", back_populates="policy")


class MailFilterRule(Base):
    __tablename__ = "mail_filter_rules"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False, index=True)
    rule_type = Column(Enum(FilterRuleType), nullable=False)
    value = Column(String, nullable=False)  # email, domain or IP
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False, index=True)
    actor_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    actor_email = Column(String, nullable=True)
    action = Column(String, nullable=False, index=True)  # e.g. "user.create"
    target_type = Column(String, nullable=True)
    target_id = Column(String, nullable=True)
    target_label = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow, index=True)


class Mailbox(Base):
    __tablename__ = "mailboxes"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=True, index=True)
    primary_address = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    organization = relationship("Organization", back_populates="mailboxes")
    messages = relationship("Message", back_populates="mailbox", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    mailbox_id = Column(Uuid, ForeignKey("mailboxes.id"), nullable=False)
    sender_email = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    snippet = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    body_s3_key = Column(String, nullable=True)
    received_at = Column(DateTime, default=utcnow)

    mailbox = relationship("Mailbox", back_populates="messages")
