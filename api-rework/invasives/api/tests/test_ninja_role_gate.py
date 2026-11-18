from api.tests.base_test_case import BaseTestCase


class NinjaRoleGateTests(BaseTestCase):
    def test_roleless_user_can_access_onboarding(self):
        headers = self.auth_headers("bc_noroles")
        self.assertEqual(
            self.client.get("/ninja/auth/user", headers=headers).status_code, 200
        )
        response = self.client.post(
            "/ninja/auth/register",
            data={
                "employer": ["MOTI"],
                "funding_agencies": ["MOTI"],
                "pac_service_numbers": [],
                "phone": None,
                "roles": ["BIOCONTROL_USER"],
                "comments": None,
            },
            content_type="application/json",
            headers=headers,
        )
        self.assertEqual(response.status_code, 201, response.content)

    def test_roleless_user_cannot_access_protected_routers(self):
        headers = self.auth_headers("bc_noroles")
        for path in (
            "/ninja/activities/",
            "/ninja/summary",
            "/ninja/teams/team",
            "/ninja/tiles/zone/0/0/0",
            "/ninja/auth/user/bc_admin",
        ):
            with self.subTest(path=path):
                self.assertEqual(
                    self.client.get(path, headers=headers).status_code, 403
                )
        self.assertEqual(
            self.client.post(
                "/ninja/recordset/rows",
                data={"filterObjects": []},
                content_type="application/json",
                headers=headers,
            ).status_code,
            403,
        )

    def test_role_holder_can_access_protected_route(self):
        response = self.client.get(
            "/ninja/teams/team", headers=self.auth_headers("bc_datamanager")
        )
        self.assertEqual(response.status_code, 200)

    def test_missing_and_unknown_credentials_do_not_access_onboarding(self):
        self.assertEqual(self.client.get("/ninja/auth/user").status_code, 401)
        self.assertEqual(
            self.client.get(
                "/ninja/auth/user", headers={"Authorization": "Bearer invalid-token"}
            ).status_code,
            401,
        )
