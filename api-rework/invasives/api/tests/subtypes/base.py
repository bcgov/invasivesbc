from abc import ABC

from django.test.client import Client
from django.test import override_settings
from rest_framework import status
from api.tests.base_test_case import BaseTestCase


@override_settings(UNIT_TESTING_ENABLED=True)
class BaseActivitySubtypeTest(BaseTestCase, ABC):
    """
    Base Class for Activity Subtypes to inherit off for common functionality/test-cases.
    Contains:
      - Common Variables
      - Common Helper Methods
      - Common Tests
    """

    ID_A = "6BBA2749-EE3D-41B6-A9F1-4A0CB37029F7"
    ID_B = "CD542709-F767-402F-818E-117B3FBC797D"

    #######
    # Helper Methods
    #######

    def fetch(self, id):
        client = Client()
        result = client.get(
            f"/activities/{id}",
            headers={"Authorization": "Bearer act_as_user=test_user"},
        )
        self.assertEqual(result.status_code, 200)
        return result

    def fetch_a(self):
        return self.fetch(self.ID_A)

    def fetch_b(self):
        return self.fetch(self.ID_B)

    def parse_422_response(self, raw_http_response):
        """
        Clean up the returned 422 errors for display in error log.
        e.g.:   [employer]: Invalid selection: 'ABCD' is not a recognized code.
                [pest_management_plan]: Invalid selection: 'PLAN-1234' is not a recognized code.
        """
        parsed = raw_http_response.json()
        formatted_errors = set()
        for e in parsed.get("detail", []):
            clean_loc = [
                x
                for x in e["loc"]
                if not (isinstance(x, str) and x.startswith("function-"))
            ]
            field = clean_loc[-1] if clean_loc else e["loc"][-1]
            msg = e.get("ctx", {}).get("error") or e.get("msg", "Validation error")
            formatted_errors.add(f"[{field}]: {msg}\n")
        return "".join(formatted_errors)

    def _post_record(self, type, payload):
        """Submit a record to the API for creation."""
        client = Client()
        result = client.post(
            f"/ninja/activities/{type}",
            headers={"Authorization": "Bearer act_as_user=test_user"},
            content_type="application/json",
            data=payload,
        )
        return result

    def draft_record(self, payload):
        return self._post_record("draft", payload)

    def draft_pydantic_protocol_test(self, empty_record, minimal_record, full_record):
        """
        Stub test for '/draft' pydantic protocols
        Expect:
            - Submitting Empty Record returns 200
            - Submitting Partial Record returns 200
            - Submitting already submitted record (form_status = 'Submitted') returns 422
        """

        empty = self.draft_record(empty_record)
        self.assertEqual(
            empty.status_code,
            200,
            f"Failed on Empty Draft record for {empty_record["subtype"]}",
        )
        partial = self.draft_record(minimal_record)
        self.assertEqual(
            partial.status_code,
            200,
            f"Failed on Partial Valid record for {minimal_record["subtype"]}",
        )
        submitted = self.draft_record(full_record)
        self.assertEqual(
            submitted.status_code,
            422,
            f"API did not reject Previously Submitted record as expected {full_record["subtype"]}",
        )

    def submit_record(self, payload):
        """
        Send submission to the API.
        Expect:
            - HTTP 200
        """
        result = self._post_record("submit", payload)
        if result.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY:
            errors = self.parse_422_response(result)
            self.fail(errors)

        self.assertEqual(result.status_code, 200)
        return result
