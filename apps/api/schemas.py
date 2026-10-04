"""Response serializers shared by routers."""
from .models import User, Domain, Group, EmailAlias, AuditLog, MailFilterRule, OrgPolicy


def _iso(dt):
    return dt.isoformat() + "Z" if dt else None


def user_out(u: User, include_aliases: bool = False) -> dict:
    name = u.display_name or " ".join(p for p in [u.first_name, u.last_name] if p) or u.email.split("@")[0]
    data = {
        "id": str(u.id),
        "organization_id": str(u.organization_id),
        "email": u.email,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "display_name": u.display_name,
        "name": name,
        "avatar_url": u.avatar_url,
        "role": u.role.value if u.role else None,
        "status": u.status.value if u.status else None,
        "storage_quota_mb": u.storage_quota_mb,
        "storage_used_mb": u.storage_used_mb,
        "recovery_email": u.recovery_email,
        "recovery_phone": u.recovery_phone,
        "mfa_enabled": bool(u.mfa_enabled),
        "last_login_at": _iso(u.last_login_at),
        "created_at": _iso(u.created_at),
    }
    if include_aliases:
        data["aliases"] = [alias_out(a) for a in (u.aliases or [])]
    return data


def alias_out(a: EmailAlias) -> dict:
    return {"id": str(a.id), "address": a.address, "created_at": _iso(a.created_at)}


def domain_out(d: Domain, user_count: int | None = None) -> dict:
    data = {
        "id": str(d.id),
        "domain_name": d.domain_name,
        "is_verified": bool(d.is_verified),
        "is_primary": bool(d.is_primary),
        "mx_status": d.mx_status,
        "spf_status": d.spf_status,
        "dkim_status": d.dkim_status,
        "dmarc_status": d.dmarc_status,
        "catch_all_address": d.catch_all_address,
        "last_checked_at": _iso(d.last_checked_at),
        "verified_at": _iso(d.verified_at),
        "created_at": _iso(d.created_at),
    }
    if user_count is not None:
        data["user_count"] = user_count
    return data


def group_out(g: Group, member_count: int | None = None) -> dict:
    data = {
        "id": str(g.id),
        "name": g.name,
        "email": g.email,
        "description": g.description,
        "access_level": g.access_level.value if g.access_level else None,
        "created_at": _iso(g.created_at),
    }
    if member_count is not None:
        data["member_count"] = member_count
    return data


def audit_out(a: AuditLog) -> dict:
    return {
        "id": str(a.id),
        "actor_email": a.actor_email,
        "action": a.action,
        "target_type": a.target_type,
        "target_id": a.target_id,
        "target_label": a.target_label,
        "details": a.details,
        "ip_address": a.ip_address,
        "created_at": _iso(a.created_at),
    }


def rule_out(r: MailFilterRule) -> dict:
    return {
        "id": str(r.id),
        "rule_type": r.rule_type.value,
        "value": r.value,
        "note": r.note,
        "created_at": _iso(r.created_at),
    }


def policy_out(p: OrgPolicy) -> dict:
    return {
        "password_min_length": p.password_min_length,
        "password_require_uppercase": p.password_require_uppercase,
        "password_require_number": p.password_require_number,
        "password_require_symbol": p.password_require_symbol,
        "enforce_mfa": p.enforce_mfa,
        "session_timeout_minutes": p.session_timeout_minutes,
        "allow_external_forwarding": p.allow_external_forwarding,
        "updated_at": _iso(p.updated_at),
    }
