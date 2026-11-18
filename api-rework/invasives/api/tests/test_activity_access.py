import datetime

from django.contrib.auth.models import AnonymousUser
from django.contrib.gis.geos import GEOSGeometry

from api.models import Role, User
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    ActivitySubtypes,
    ActivityType,
    DraftActivity,
    DraftActivityDataRecord,
    DraftTerrestrialBiocontrolCollectionEntry,
    DraftTerrestrialBiocontrolReleaseEntry,
    Employer,
    FundingAgency,
)
from api.models.auth import AgencyAssociation, EmployerAssociation
from api.models.iapp import IAPPSite
from api.permissions.activity_access import (
    ActivityAccess,
    filter_activities_by_access,
    get_activity_access,
    get_activity_permissions,
)
from api.tests.base_test_case import BaseTestCase


class ActivityAccessTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        def user(name, *roles):
            result = User.objects.create(subject=name)
            for role in roles:
                role, _ = Role.objects.get_or_create(name=role)
                result.roles.add(role)
            return result

        cls.admin = user("policy_admin", "ADMINISTRATOR")
        cls.master = user("policy_master", "MASTER_ADMINISTRATOR")
        cls.manager = user("policy_manager", "DATA_MANAGER")
        cls.staff = user("policy_staff", "BCGOV_STAFF_PLANTS")
        cls.bio = user("policy_bio", "BIOCONTROL_USER")
        cls.no_roles = user("policy_none")
        cls.plant_admin = user("policy_plant_admin", "ADMINISTRATOR_PLANTS")
        cls.contractor = user("policy_contractor", "CONTRACTOR_MANAGER_PLANTS")

        def activity(subtype, creator):
            return Activity.objects.create(
                type=ActivityType.Observation,
                subtype=subtype.name,
                date=datetime.date(2024, 1, 1),
                created_by="creator",
                creating_user=creator,
                shape=GEOSGeometry("POINT(-123 49)", srid=3005),
            )

        cls.observation = activity(
            ActivitySubtypes.Observation_Plant_Terrestrial, cls.staff
        )
        cls.other = activity(
            ActivitySubtypes.Observation_Plant_Terrestrial, cls.manager
        )
        cls.draft = DraftActivity.objects.create(
            type=ActivityType.Biocontrol,
            subtype=ActivitySubtypes.Biocontrol_Release.name,
            date=datetime.date(2024, 1, 1),
            created_by="creator",
            creating_user=cls.staff,
        )
        cls.draft_data = DraftActivityDataRecord.objects.create(activity=cls.draft)
        cls.agent = DraftTerrestrialBiocontrolReleaseEntry.objects.create(
            activity_data_record=cls.draft_data, biocontrol_agent_id="ACERGEN"
        )

    def test_role_matrix_and_flags(self):
        cases = [
            (self.admin, self.observation, ActivityAccess.READ | ActivityAccess.MODIFY),
            (
                self.master,
                self.observation,
                ActivityAccess.READ | ActivityAccess.MODIFY,
            ),
            (self.manager, self.other, ActivityAccess.READ),
            (self.staff, self.observation, ActivityAccess.READ | ActivityAccess.MODIFY),
            (self.staff, self.other, ActivityAccess.READ),
            (self.plant_admin, self.other, ActivityAccess.READ | ActivityAccess.MODIFY),
            (self.bio, self.observation, ActivityAccess.NONE),
            (self.no_roles, self.observation, ActivityAccess.NONE),
            (AnonymousUser(), self.observation, ActivityAccess.NONE),
        ]
        for principal, record, expected in cases:
            with self.subTest(principal=principal):
                self.assertEqual(get_activity_access(principal, record), expected)
                visible = filter_activities_by_access(
                    Activity.objects.filter(pk=record.pk), principal
                ).exists()
                self.assertEqual(visible, bool(expected & ActivityAccess.READ))

        self.assertEqual(
            get_activity_permissions(self.admin, self.observation),
            {"can_edit": True, "can_submit": False, "can_delete": False},
        )

    def test_draft_owner_and_sensitive_agent(self):
        allowed = ActivityAccess.READ | ActivityAccess.MODIFY | ActivityAccess.SUBMIT
        self.assertEqual(get_activity_access(self.staff, self.draft), allowed)
        self.assertEqual(
            get_activity_access(self.manager, self.draft), ActivityAccess.NONE
        )
        self.assertEqual(get_activity_access(self.admin, self.draft), allowed)
        self.agent.biocontrol_agent_id = "ACERANG"
        self.agent.save()
        self.assertEqual(
            get_activity_access(self.staff, self.draft), ActivityAccess.NONE
        )
        self.assertEqual(get_activity_access(self.admin, self.draft), allowed)
        self.agent.biocontrol_agent = None
        self.agent.save()
        self.assertEqual(
            get_activity_access(self.staff, self.draft), ActivityAccess.NONE
        )
        self.agent.biocontrol_agent_id = "LONGJAC"
        self.agent.save()
        self.assertEqual(
            get_activity_access(self.staff, self.draft), ActivityAccess.NONE
        )

    def test_protected_iapp_site(self):
        self.draft.subtype = ActivitySubtypes.Biocontrol_Collection.name
        self.draft.save()
        self.agent.delete()
        IAPPSite.objects.create(site_id=12345678, protected=True)
        DraftTerrestrialBiocontrolCollectionEntry.objects.create(
            activity_data_record=self.draft_data,
            biocontrol_agent_id="ACERGEN",
            historical_iapp_site=12345678,
        )
        self.assertEqual(
            get_activity_access(self.staff, self.draft), ActivityAccess.NONE
        )
        self.assertTrue(
            get_activity_access(self.admin, self.draft) & ActivityAccess.READ
        )

    def test_employer_scope_must_be_primary_and_current(self):
        data = ActivityDataRecord.objects.create(activity=self.other)
        from api.models.codes import EmployerCode

        code = EmployerCode.objects.first()
        Employer.objects.create(activity_data_record=data, employer=code)
        association = EmployerAssociation.objects.create(
            user=self.contractor, employer=code, is_primary=False
        )
        self.assertEqual(
            get_activity_access(self.contractor, self.other), ActivityAccess.READ
        )
        association.is_primary = True
        association.save()
        self.assertEqual(
            get_activity_access(self.contractor, self.other),
            ActivityAccess.READ | ActivityAccess.MODIFY,
        )
        association.expires = datetime.datetime(
            2020, 1, 1, tzinfo=datetime.timezone.utc
        )
        association.save()
        self.assertEqual(
            get_activity_access(self.contractor, self.other), ActivityAccess.READ
        )

    def test_agency_scope_requires_current_primary_association(self):
        from api.models.codes import FundingAgencyCode

        manager = User.objects.create(subject="policy_agency_manager")
        role, _ = Role.objects.get_or_create(name="INDIGENOUS_RISO_MANAGER_PLANTS")
        manager.roles.add(role)
        data = ActivityDataRecord.objects.create(activity=self.other)
        agency = FundingAgencyCode.objects.first()
        FundingAgency.objects.create(activity_data_record=data, agency=agency)
        association = AgencyAssociation.objects.create(
            user=manager, agency=agency, is_primary=True
        )
        self.assertEqual(
            get_activity_access(manager, self.other),
            ActivityAccess.READ | ActivityAccess.MODIFY,
        )
        association.expires = datetime.datetime(
            2020, 1, 1, tzinfo=datetime.timezone.utc
        )
        association.save()
        self.assertEqual(get_activity_access(manager, self.other), ActivityAccess.READ)
