from api.tests.subtypes.base import BaseActivitySubtypeTest
from api.models.audits import ActivityModificationRecord
from api.models.activity import Activity
from api.tests.mock_frontend_submissions import (
    MINIMAL_TERRESTRIAL_OBSERVATION,
    UPDATED_TERRESTRIAL_OBSERVATION,
)


class TestModificationRecord(BaseActivitySubtypeTest):
    """
    Tests that modifying a record will create an audit trail
    """

    fixtures = [
        "test/common/test_employer_codes",
        "test/common/test_jurisdictions_codes",
        "test/common/test_funding_agency_codes",
        "test/common/test_invasive_plant_codes",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_employer",
        "test/subtypes/observations/test_terrestrial_observation_codes",
        "test/subtypes/observations/test_terrestrial_observation",
        "test/common/test_participants",
    ]

    def get_audit_trail(self, id):
        instance = Activity.objects.get(id=id)
        return ActivityModificationRecord.objects.filter(activity=instance)

    def test_updating_record_creates_audit_log(self):
        """
        Expect:
        - Updating a previously submitted record creates an audit trail
        """
        activity_id = MINIMAL_TERRESTRIAL_OBSERVATION["id"]

        self.submit_record(MINIMAL_TERRESTRIAL_OBSERVATION)
        records = self.get_audit_trail(id=activity_id)
        self.assertEqual(
            len(records), 0, "An unexpected modification record was created."
        )

        self.submit_record(UPDATED_TERRESTRIAL_OBSERVATION)
        records = self.get_audit_trail(id=activity_id)
        self.assertGreater(
            len(records), 0, "No modification record was created when expected."
        )

    def test_resubmitting_unchanged_record_does_not_create_audit_log(self):
        """
        Expect:
        - Resubmitting an existing record with no changes does not create a new record
        """
        activity_id = UPDATED_TERRESTRIAL_OBSERVATION["id"]

        self.submit_record(UPDATED_TERRESTRIAL_OBSERVATION)
        records = self.get_audit_trail(id=activity_id)
        self.assertEqual(
            len(records), 0, "An unexpected modification record was created."
        )

        self.submit_record(UPDATED_TERRESTRIAL_OBSERVATION)
        records = self.get_audit_trail(id=activity_id)
        self.assertEqual(
            len(records),
            0,
            "An unexpected modification record was created when a payload was resubmitted.",
        )
