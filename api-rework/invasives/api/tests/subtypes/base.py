from abc import ABC

from api.models.activity import DraftActivity
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

    def match_common_fields(self, record_in: dict, record_out: dict):
        """
        Expect:
            - Common fields (jurisdictions, access description, etc) match between Payload/Submission
        """
        # General
        self.assertEqual(record_in["id"], record_out["id"])
        self.assertEqual(record_in["short_id"], record_out["short_id"])
        self.assertEqual(record_in["type"], record_out["type"])
        self.assertEqual(record_in["subtype"], record_out["subtype"])
        self.assertEqual(record_in["date"], record_out["date"])

        self.assertGreater(
            len(record_out["projects"]), 0, "Project Codes were not populated"
        )
        self.assertEqual(
            record_in["projects"],
            record_out["projects"],
        )

        self.assertGreater(
            len(record_out["jurisdictions"]), 0, "Project Codes were not populated"
        )
        self.assertEqual(
            record_in["jurisdictions"],
            record_out["jurisdictions"],
        )

        # Textbox fields
        self.assertEqual(
            record_in["location_description"],
            record_out["location_description"],
        )
        self.assertEqual(
            record_in["comment"],
            record_out["comment"],
        )
        self.assertEqual(
            record_in["location_description"],
            record_out["location_description"],
        )
        self.assertEqual(
            record_in["access_description"],
            record_out["access_description"],
        )
        self.assertEqual(
            record_in["location_description"],
            record_out["location_description"],
        )

        # User Fields
        self.assertEqual(
            record_in["created_by"],
            record_out["created_by"],
        )
        self.assertGreater(
            len(record_out["employer"]), 0, "Employer fields not populated"
        )
        self.assertEqual(
            record_in["employer"],
            record_out["employer"],
        )
        self.assertGreater(
            len(record_out["funding_agencies"]), 0, "Funding Agencies not populated"
        )
        self.assertEqual(
            record_in["funding_agencies"],
            record_out["funding_agencies"],
        )

        self.assertGreater(
            len(record_out["participants"]), 0, "Participants not populated"
        )
        for p_in, p_out in zip(record_in["participants"], record_out["participants"]):
            self.assertEqual(p_in["name"], p_out["name"])
            if pac_number := p_in.get("pac_number", None):
                self.assertEqual(pac_number, int(p_out["pac_number"]))

        # Spatial Fields
        self.assertEqual(record_in["area_m"], record_out["area_m"])
        self.assertEqual(record_in["utm_zone"], record_out["utm_zone"])
        self.assertEqual(record_in["utm_easting"], record_out["utm_easting"])
        self.assertEqual(record_in["utm_northing"], record_out["utm_northing"])

        self.assertAlmostEqual(
            float(record_in["longitude"]), float(record_out["longitude"]), places=5
        )
        self.assertAlmostEqual(
            float(record_in["latitude"]), float(record_out["latitude"]), places=5
        )

    def draft_record_was_removed_by_submit(self, minimal_payload):
        """
        Expect:
            - Draft Record is deleted when submitted record instantiated
        """
        # Draft Record.
        res = self.draft_record(minimal_payload)
        self.assertEqual(res.status_code, 200)

        # Resubmit Record as Submission.
        res = self.submit_record(minimal_payload)
        self.assertEqual(res.status_code, 200)

        # Check if Draft Record still exists
        draft_record_exists = DraftActivity.objects.filter(
            id=minimal_payload["id"]
        ).exists()

        self.assertFalse(
            draft_record_exists,
            f"Draft record was not deleted after submission made for {minimal_payload["subtype"]} record",
        )
