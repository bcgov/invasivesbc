from django.test.client import Client
from api.tests.base_test_case import BaseTestCase
from api.models.auth import User
from rest_framework import status


class BugReportTest(BaseTestCase):
    base_url = "/ninja/app_report"

    client = Client()

    NO_ROLE_USER = "bc_noroles"
    NONE = 0

    def post(self, url, payload, user: str = "bc_admin"):
        headers = self.auth_headers(user) if user else None
        return self.client.post(
            self.base_url + url,
            content_type="application/json",
            data=payload,
            headers=headers,
        )

    def get(self, url, user: str = "bc_admin"):
        headers = self.auth_headers(user) if user else None
        return self.client.get(
            self.base_url + url,
            content_type="application/json",
            headers=headers,
        )

    def test_bug_report_workflow(self):
        BUG_REPORT_ONE_CONFIG = {
            "device": "Ios",
            "description": "Test Bug Report 1",
            "title": "Test Bug Report 1",
            "reproducible": True,
            "expected_behavior": "Expected Behavior",
            "offline": False,
            "online": True,
            "issue_type": "VS",
        }

        ####################
        ## CREATE NEW BUG REPORT
        ####################

        ## New Bug Report Created -- Accepted
        res = self.post(url="/bug_report", payload=BUG_REPORT_ONE_CONFIG)
        print(f"Num users {User.objects.all().count()}")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        BUG_REPORT_ID = data["id"]
        self.assertIsNotNone(BUG_REPORT_ID)

        ## Create New Bug Report -- Denied (Unauthorized)
        res = self.post(
            url="/bug_report",
            payload={
                **BUG_REPORT_ONE_CONFIG,
                "name": "Unauthorized Bug Report Creation",
            },
            user=self.NO_ROLE_USER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ##########
        ## BUG REPORT FETCHING
        ##########

        ## Fetch Bug Reports Page  -- Success
        res = self.get(url=f"/bug_report")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()["entries"]

        # Check if initial bug report created is present in the list
        self.assertEqual(data[0]["title"], "Test Bug Report 1")
        self.assertIsNotNone(data[0]["id"])
        self.assertTrue(data[0]["online"])
        self.assertIsNotNone(data[0]["title"])
        self.assertIsNotNone(data[0]["issue_type"])

        ## Fetch Bug Reports Unauthorized -- Denied
        res = self.get(url=f"/bug_report", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Fetch Specified Bug Report Authorized -- Success
        res = self.get(url=f"/bug_report/{BUG_REPORT_ID}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Fetch Specified Bug Report Unauthorized -- Denied
        res = self.get(url=f"/bug_report/{BUG_REPORT_ID}", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
