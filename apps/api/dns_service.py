"""DNS verification + DKIM key generation for tenant domains."""
import os
import re
import secrets
import base64
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import dns.asyncresolver
import dns.exception
import dns.resolver

MX_HOSTS = [h.strip() for h in os.getenv("MAIL_MX_HOSTS", "mx1.mailflow.app,mx2.mailflow.app").split(",") if h.strip()]
SPF_INCLUDE = os.getenv("MAIL_SPF_INCLUDE", "spf.mailflow.app")
VERIFY_PREFIX = "mailflow-verification="

DOMAIN_RE = re.compile(r"^(?=.{4,253}$)(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,63}$")


def normalize_domain(name: str) -> str:
    name = name.strip().lower().rstrip(".")
    for prefix in ("http://", "https://"):
        if name.startswith(prefix):
            name = name[len(prefix):]
    name = name.split("/")[0]
    if name.startswith("www."):
        name = name[4:]
    return name


def is_valid_domain(name: str) -> bool:
    return bool(DOMAIN_RE.match(name))


def new_verification_token() -> str:
    return secrets.token_hex(16)


def generate_dkim_keypair() -> tuple[str, str]:
    """Returns (private_pem, public_key_base64_for_dns)."""
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    ).decode()
    public_der = key.public_key().public_bytes(
        serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return private_pem, base64.b64encode(public_der).decode()


# ---- Resolvers (module-level so tests can monkeypatch) ----

async def resolve_txt(name: str) -> list[str]:
    try:
        answer = await dns.asyncresolver.resolve(name, "TXT", lifetime=5)
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers, dns.exception.Timeout):
        return []
    records = []
    for rdata in answer:
        records.append(b"".join(rdata.strings).decode(errors="ignore"))
    return records


async def resolve_mx(name: str) -> list[str]:
    try:
        answer = await dns.asyncresolver.resolve(name, "MX", lifetime=5)
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers, dns.exception.Timeout):
        return []
    return [str(r.exchange).rstrip(".").lower() for r in answer]


# ---- Expected records shown in the admin UI ----

def expected_records(domain) -> dict:
    name = domain.domain_name
    return {
        "verification": {
            "type": "TXT", "host": "@", "value": f"{VERIFY_PREFIX}{domain.verification_token}",
        },
        "mx": [
            {"type": "MX", "host": "@", "value": host, "priority": 10 * (i + 1)}
            for i, host in enumerate(MX_HOSTS)
        ],
        "spf": {"type": "TXT", "host": "@", "value": f"v=spf1 include:{SPF_INCLUDE} ~all"},
        "dkim": {
            "type": "TXT",
            "host": f"{domain.dkim_selector}._domainkey",
            "value": f"v=DKIM1; k=rsa; p={domain.dkim_public_key}",
        },
        "dmarc": {
            "type": "TXT", "host": "_dmarc",
            "value": f"v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@{name}; pct=100",
        },
    }


# ---- Checks ----

async def check_verification(domain) -> bool:
    records = await resolve_txt(domain.domain_name)
    expected = f"{VERIFY_PREFIX}{domain.verification_token}"
    return any(r.strip() == expected for r in records)


async def check_mx(domain) -> str:
    hosts = await resolve_mx(domain.domain_name)
    if not hosts:
        return "missing"
    return "ok" if any(h in MX_HOSTS for h in hosts) else "invalid"


async def check_spf(domain) -> str:
    spf = [r for r in await resolve_txt(domain.domain_name) if r.lower().startswith("v=spf1")]
    if not spf:
        return "missing"
    if len(spf) > 1:
        return "invalid"  # multiple SPF records is an RFC violation
    return "ok" if f"include:{SPF_INCLUDE}" in spf[0].lower() else "invalid"


async def check_dkim(domain) -> str:
    records = await resolve_txt(f"{domain.dkim_selector}._domainkey.{domain.domain_name}")
    dkim = [r for r in records if "v=dkim1" in r.lower().replace(" ", "")]
    if not dkim:
        return "missing"
    compact = dkim[0].replace(" ", "")
    return "ok" if f"p={domain.dkim_public_key}" in compact else "invalid"


async def check_dmarc(domain) -> str:
    records = [r for r in await resolve_txt(f"_dmarc.{domain.domain_name}") if r.lower().startswith("v=dmarc1")]
    if not records:
        return "missing"
    return "ok" if re.search(r"p\s*=\s*(none|quarantine|reject)", records[0], re.I) else "invalid"
