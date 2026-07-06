import copy
from .base import BaseActivitySubtypeTest
from api.models.activity import Activity, DraftActivity
from api.tests.mock_frontend_submissions import (
    EMPTY_MONITORING_MECH_TREATMENT,
    MINIMAL_MONITORING_MECH_TREATMENT,
    UPDATED_MONITORING_MECH_TREATMENT,
)


class MechanicalTreatmentMonitoringTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_invasive_plant_codes",
        "test/common/test_invasive_plant_codes",
        "test/subtypes/monitoring/test_chem_mech_treatment_monitoring_codes",
        "test/subtypes/monitoring/test_mechanical_treatment_monitoring",
        "test/common/test_participants",
    ]

    def test_subtype_details_full(self):
        """Subtype keys match the information from fixtures."""
        response_object = self.fetch_a().json()
        tmi = response_object["subtype_data"]["entries"]
        self.assertEqual(len(tmi), 1)
        tmi = tmi[0]
        self.assertEqual(tmi["comment"], "Several plants remain")
        self.assertEqual(tmi["treatment_pass"], "Second")
        self.assertEqual(tmi["invasive_plant"], "JK")
        self.assertEqual(tmi["evidence_of_treatment"], "No")
        self.assertEqual(tmi["management_efficacy_rating"], "6M")

    def match_updated_subtype_details(
        self,
        record_in: dict,
        record_out: DraftActivity["subtype_data"] | Activity["subtype_data"],
    ):
        # Entries Section
        self.assertGreater(
            len(record_out["entries"]),
            0,
            "No Monitoring Entries were created",
        )
        ## Terrestrial
        entry_in = record_in["entries"][0]
        entry_out = record_out["entries"][0]

        self.assertEqual(
            entry_in["invasive_plant"],
            entry_out["invasive_plant"],
        )
        self.assertEqual(
            entry_in["evidence_of_treatment"],
            entry_out["evidence_of_treatment"],
        )
        self.assertEqual(
            entry_in["treatment_pass"],
            entry_out["treatment_pass"],
        )
        self.assertEqual(
            entry_in["comment"],
            entry_out["comment"],
        )
        self.assertEqual(
            entry_in["management_efficacy_rating"],
            entry_out["management_efficacy_rating"],
        )
        self.assertEqual(
            entry_in["treatment_efficacy_rating"],
            entry_out["treatment_efficacy_rating"],
        )
        self.assertIsNone(entry_out.get("invasive_plant_aquatic"))

        self.assertGreater(
            len(entry_out["invasive_plants_on_site"]),
            0,
            "Invasive Plant on Site was not populated",
        )
        self.assertEqual(
            entry_in["invasive_plants_on_site"],
            entry_out["invasive_plants_on_site"],
        )

        ## Aquatic
        entry_in = record_in["entries"][1]
        entry_out = record_out["entries"][1]

        self.assertEqual(
            entry_in["invasive_plant_aquatic"],
            entry_out["invasive_plant_aquatic"],
        )
        self.assertEqual(
            entry_in["evidence_of_treatment"],
            entry_out["evidence_of_treatment"],
        )
        self.assertEqual(
            entry_in["treatment_pass"],
            entry_out["treatment_pass"],
        )
        self.assertEqual(
            entry_in["comment"],
            entry_out["comment"],
        )
        self.assertEqual(
            entry_in["management_efficacy_rating"],
            entry_out["management_efficacy_rating"],
        )
        self.assertEqual(
            entry_in["treatment_efficacy_rating"],
            entry_out["treatment_efficacy_rating"],
        )
        self.assertIsNone(entry_out.get("invasive_plant"))

        self.assertGreater(
            len(entry_out["invasive_plants_on_site"]),
            0,
            "Invasive Plant on Site was not populated",
        )
        self.assertEqual(
            entry_in["invasive_plants_on_site"],
            entry_out["invasive_plants_on_site"],
        )

    def test_draft_submissions(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is created in DB
        """

        payload = EMPTY_MONITORING_MECH_TREATMENT

        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)

        record_exists = DraftActivity.objects.filter(pk=payload["id"]).exists()
        self.assertTrue(record_exists, "Record failed to be created")

    def test_submit_record(self):
        """
        Expect:
            - Submitting Record returns 200
            - Record is created in DB
        """
        payload = MINIMAL_MONITORING_MECH_TREATMENT
        self.submit_record(payload).json()
        record = self.fetch(id=payload["id"]).json()

        self.assertIsNotNone(record)

    def test_update_draft_submission(self):
        """
        Expect:
            - Submitting Draft returns 200
            - Record is updated in DB
        """
        payload = copy.deepcopy(UPDATED_MONITORING_MECH_TREATMENT)
        payload["form_status"] = "Draft"

        # Submit initial Draft
        res = self.draft_record(MINIMAL_MONITORING_MECH_TREATMENT)

        # Update Draft Record
        res = self.draft_record(payload)
        self.assertEqual(res.status_code, 200)
        record = res.json()

        # Update didn't delete DraftActivity,
        record_exists = DraftActivity.objects.filter(id=payload["id"]).exists()
        self.assertTrue(record_exists, "Record no longer exists in DB after update")

        self.match_updated_subtype_details(
            record_in=payload["subtype_data"],
            record_out=record["subtype_data"],
        )

    def test_update_record(self):
        payload = UPDATED_MONITORING_MECH_TREATMENT

        # Set Initial Record
        self.submit_record(MINIMAL_MONITORING_MECH_TREATMENT)

        # Update Record
        response = self.submit_record(payload)
        record = response.json()

        self.match_updated_subtype_details(
            record_in=payload["subtype_data"],
            record_out=record["subtype_data"],
        )

    def test_draft_record_was_removed_by_submit(self):
        payload = MINIMAL_MONITORING_MECH_TREATMENT
        self.draft_record_was_removed_by_submit(payload)
