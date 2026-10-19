import datetime

from django.contrib.gis.geos import GEOSGeometry

from api.constants import WellKnownRoles
from api.models import Role, User
from api.models.activity import Activity, ActivitySubtypes, ActivityType
from api.permissions.activity_access import (
    ActivityAccess,
    filter_activities_by_access,
    get_activity_access,
)
from api.tests.base_test_case import BaseTestCase


class ActivityAccessTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        Role.objects.get_or_create(name=WellKnownRoles.MASTER_ADMINISTRATOR.value)
        cls.master = User.objects.create(subject="bc_master")
        cls.master.roles.add(WellKnownRoles.MASTER_ADMINISTRATOR.value)
        cls.owner = User.objects.create(subject="bc_owner")
        cls.owner.roles.add(WellKnownRoles.DATA_MANAGER.value)
        cls.biocontrol_owner = User.objects.create(subject="bc_bio_owner")
        cls.biocontrol_owner.roles.add(WellKnownRoles.DATA_MANAGER.value)

        cls.users = {
            name: User.objects.get(subject=f"bc_{name}")
            for name in ("admin", "biocontrol", "datamanager", "noroles")
        }
        cls.users["master"] = cls.master
        cls.users["owner"] = cls.owner

        def make(i, type_, creator):
            return Activity.objects.create(
                short_id=f"A{i}",
                type=type_,
                subtype=next(iter(ActivitySubtypes)).name,
                date=datetime.date(2024, 1, 1),
                created_by="x",
                creating_user=creator,
                shape=GEOSGeometry("POINT(-123 49)", srid=4326),
            )

        cls.owner_obs = make(1, ActivityType.Observation, cls.owner)
        cls.other_obs = make(2, ActivityType.Observation, cls.users["datamanager"])
        cls.owner_bio = make(3, ActivityType.Biocontrol, cls.owner)
        cls.other_bio = make(4, ActivityType.Biocontrol, cls.users["datamanager"])
        cls.orphan_obs = make(5, ActivityType.Observation, None)
        cls.all_ids = {
            a.id
            for a in (
                cls.owner_obs,
                cls.other_obs,
                cls.owner_bio,
                cls.other_bio,
                cls.orphan_obs,
            )
        }

    def visible(self, user):
        qs = filter_activities_by_access(Activity.objects.all(), user)
        return set(qs.values_list("id", flat=True))

    def test_admins_see_everything(self):
        for name in ("admin", "master"):
            self.assertEqual(self.visible(self.users[name]), self.all_ids, name)

    def non_bio_ids(self):
        return {self.owner_obs.id, self.other_obs.id, self.orphan_obs.id}

    def test_biocontrol_user_sees_everything(self):
        self.assertEqual(self.visible(self.users["biocontrol"]), self.all_ids)

    def test_role_holders_see_all_but_biocontrol(self):
        for name in ("owner", "datamanager"):
            self.assertEqual(self.visible(self.users[name]), self.non_bio_ids(), name)

    def test_creator_without_biocontrol_role_cannot_see_own_biocontrol(self):
        self.assertNotIn(self.owner_bio.id, self.visible(self.owner))

    def test_noroles_user_sees_nothing(self):
        self.assertEqual(self.visible(self.users["noroles"]), set())

    def test_noroles_creator_sees_own_non_biocontrol(self):
        user = self.users["noroles"]
        self.other_obs.creating_user = user
        self.other_obs.save()
        self.other_bio.creating_user = user
        self.other_bio.save()
        self.assertEqual(self.visible(user), {self.other_obs.id})

    def test_unauthenticated_sees_nothing(self):
        from django.contrib.auth.models import AnonymousUser

        self.assertEqual(self.visible(AnonymousUser()), set())

    def test_required_flags_beyond_read_return_nothing(self):
        for level in (
            ActivityAccess.MODIFY,
            ActivityAccess.SUBMIT,
            ActivityAccess.DELETE,
        ):
            qs = filter_activities_by_access(
                Activity.objects.all(), self.users["admin"], level
            )
            self.assertFalse(qs.exists(), level)

    def test_queryset_filter_matches_instance_function(self):
        for name, user in self.users.items():
            expected = {
                a.id
                for a in Activity.objects.all()
                if get_activity_access(user, a) & ActivityAccess.READ
            }
            self.assertEqual(self.visible(user), expected, name)

    def test_instance_levels(self):
        cases = [
            (self.owner, self.other_obs, ActivityAccess.READ),
            (self.owner, self.owner_bio, ActivityAccess.NONE),
            (self.users["biocontrol"], self.other_bio, ActivityAccess.READ),
            (self.users["admin"], self.other_bio, ActivityAccess.READ),
            (self.users["noroles"], self.other_obs, ActivityAccess.NONE),
        ]
        for user, activity, expected in cases:
            self.assertEqual(get_activity_access(user, activity), expected)
