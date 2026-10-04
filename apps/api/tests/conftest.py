import os
import sys

# Point the app at a throwaway SQLite DB before anything imports api.database
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_mailflow.db"
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import pytest
import httpx
from api.database import engine, Base
from api.main import app
from api import dns_service

STRONG_PW = "Secur3Pass!"


@pytest.fixture(autouse=True)
async def fresh_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


@pytest.fixture
def fake_dns(monkeypatch):
    """In-memory DNS zone. Tests populate `zone` with TXT/MX records."""
    zone = {"TXT": {}, "MX": {}}

    async def resolve_txt(name):
        return zone["TXT"].get(name, [])

    async def resolve_mx(name):
        return zone["MX"].get(name, [])

    monkeypatch.setattr(dns_service, "resolve_txt", resolve_txt)
    monkeypatch.setattr(dns_service, "resolve_mx", resolve_mx)
    return zone


@pytest.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def signup(client, email="owner@gmail.com", org="Acme Inc"):
    r = await client.post("/api/v1/auth/signup", json={
        "organization_name": org, "first_name": "Owner", "last_name": "One",
        "email": email, "password": STRONG_PW,
    })
    assert r.status_code == 201, r.text
    return r.json()


def auth(token):
    return {"Authorization": f"Bearer {token}"}


async def add_verified_domain(client, token, zone, name="acme.com"):
    r = await client.post("/api/admin/v1/domains", json={"domain_name": name}, headers=auth(token))
    assert r.status_code == 201, r.text
    domain_id = r.json()["id"]
    detail = (await client.get(f"/api/admin/v1/domains/{domain_id}", headers=auth(token))).json()
    zone["TXT"][name] = [detail["dns_records"]["verification"]["value"]]
    r = await client.post(f"/api/admin/v1/domains/{domain_id}/verify", headers=auth(token))
    assert r.status_code == 200, r.text
    return domain_id, detail
