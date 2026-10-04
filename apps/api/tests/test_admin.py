from conftest import signup, auth, add_verified_domain, STRONG_PW

async def test_full_admin_flow(client, fake_dns):
    # 1. Signup creates super admin and org
    owner = await signup(client)
    token = owner["access_token"]
    org_id = owner["user"]["organization_id"]

    # 2. Add and verify domain
    dom_id, dom_data = await add_verified_domain(client, token, fake_dns, "acme.com")
    
    # DNS check (setup fake DNS first)
    fake_dns["MX"]["acme.com"] = ["mx1.mailflow.app"]
    fake_dns["TXT"]["acme.com"] = [dom_data["dns_records"]["verification"]["value"], "v=spf1 include:spf.mailflow.app ~all"]
    fake_dns["TXT"][f"{dom_data['dns_records']['dkim']['host']}.acme.com"] = [dom_data["dns_records"]["dkim"]["value"]]
    fake_dns["TXT"]["_dmarc.acme.com"] = ["v=DMARC1; p=reject"]
    
    dns_res = await client.post(f"/api/admin/v1/domains/{dom_id}/check-dns", headers=auth(token))
    assert dns_res.status_code == 200, dns_res.text
    dns_data = dns_res.json()
    assert dns_data["mx_status"] == "ok"
    assert dns_data["spf_status"] == "ok"
    assert dns_data["dkim_status"] == "ok"
    assert dns_data["dmarc_status"] == "ok"

    # 3. Add user on verified domain
    user_res = await client.post("/api/admin/v1/users", json={
        "email": "employee@acme.com",
        "first_name": "Emp",
        "password": STRONG_PW,
        "role": "member",
        "storage_quota_mb": 2048,
    }, headers=auth(token))
    assert user_res.status_code == 201, user_res.text
    emp = user_res.json()

    # 4. Add alias
    alias_res = await client.post(f"/api/admin/v1/users/{emp['id']}/aliases", json={"address": "sales@acme.com"}, headers=auth(token))
    assert alias_res.status_code == 201, alias_res.text

    # 5. Add group
    group_res = await client.post("/api/admin/v1/groups", json={
        "name": "Acme Team",
        "email": "team@acme.com",
        "member_ids": [emp["id"]],
    }, headers=auth(token))
    assert group_res.status_code == 201, group_res.text
    group = group_res.json()
    assert len(group["members"]) == 1

    # 6. Check Dashboard and Audit Logs
    dash = await client.get("/api/admin/v1/dashboard", headers=auth(token))
    assert dash.status_code == 200
    d = dash.json()
    assert d["users"]["total"] == 2
    assert d["domains"]["total"] == 1
    assert d["domains"]["verified"] == 1
    assert d["groups"] == 1
    assert d["aliases"] == 1

    logs = await client.get("/api/admin/v1/audit-logs", headers=auth(token))
    assert logs.status_code == 200
    assert len(logs.json()["items"]) > 0

    # 7. Role isolation: Member cannot access admin routes
    emp_token = (await client.post("/api/v1/auth/login", json={"email": "employee@acme.com", "password": STRONG_PW})).json()["access_token"]
    assert (await client.get("/api/admin/v1/dashboard", headers=auth(emp_token))).status_code == 403

    # 8. Uniqueness checks across addressing types
    dup = await client.post("/api/admin/v1/users", json={"email": "sales@acme.com", "first_name": "Dup", "password": STRONG_PW}, headers=auth(token))
    assert dup.status_code == 400
    assert "in use" in dup.json()["detail"]
