import datetime
from unittest import mock

from django.contrib.gis.geos import GEOSGeometry

from api.constants import WellKnownRoles
from api.models import Role, User
from api.models.activity import Activity, ActivitySubtypes, ActivityType
from api.ninja_authentication import NinjaKeycloakAuthentication
from api.tests.base_test_case import BaseTestCase

BASE = "/ninja/activities"


def fake_authenticate(self, request, token):
    return User.objects.filter(subject=token).first()


class ActivityNinjaAccessTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        Role.objects.get_or_create(name=WellKnownRoles.MASTER_ADMINISTRATOR.value)
        master = User.objects.create(subject="bc_master")
        master.roles.add(WellKnownRoles.MASTER_ADMINISTRATOR.value)
        owner = User.objects.create(subject="bc_owner")
        owner.roles.add(WellKnownRoles.DATA_MANAGER.value)
        other = User.objects.get(subject="bc_datamanager")

        def make(i, type_, creator):
            return Activity.objects.create(
                short_id=f"N{i}",
                type=type_,
                subtype=next(iter(ActivitySubtypes)).name,
                date=datetime.date(2024, 1, 1),
                created_by="x",
                creating_user=creator,
                shape=GEOSGeometry("POINT(-123 49)", srid=4326),
            )

        cls.owner_obs = make(1, ActivityType.Observation, owner)
        cls.other_obs = make(2, ActivityType.Observation, other)
        cls.owner_bio = make(3, ActivityType.Biocontrol, owner)
        cls.other_bio = make(4, ActivityType.Biocontrol, other)
        cls.all_ids = {
            str(a.id)
            for a in (cls.owner_obs, cls.other_obs, cls.owner_bio, cls.other_bio)
        }

    def setUp(self):
        patcher = mock.patch.object(
            NinjaKeycloakAuthentication, "authenticate", fake_authenticate
        )
        patcher.start()
        self.addCleanup(patcher.stop)

    def get(self, subject, path=""):
        return self.client.get(
            f"{BASE}{path}", headers={"Authorization": f"Bearer {subject}"}
        )

    def post(self, subject, path, body):
        return self.client.post(
            f"{BASE}{path}",
            body,
            content_type="application/json",
            headers={"Authorization": f"Bearer {subject}"},
        )

    def ids(self, response):
        self.assertEqual(response.status_code, 200, response.content)
        return {str(i["id"]) for i in response.json()}

    def test_list_by_user(self):
        non_bio = {str(self.owner_obs.id), str(self.other_obs.id)}
        expected = {
            "bc_admin": self.all_ids,
            "bc_master": self.all_ids,
            "bc_owner": non_bio,
            "bc_biocontrol": self.all_ids,
            "bc_noroles": set(),
        }
        for subject, ids in expected.items():
            self.assertEqual(self.ids(self.get(subject, "/")), ids, subject)

    def test_search_by_user(self):
        body = {"date_from": "2023-01-01", "date_to": "2025-01-01"}
        expected = {
            "bc_admin": self.all_ids,
            "bc_biocontrol": self.all_ids,
            "bc_owner": {str(self.owner_obs.id), str(self.other_obs.id)},
            "bc_noroles": set(),
        }
        for subject, ids in expected.items():
            response = self.post(subject, "/search", body)
            self.assertEqual(response.status_code, 200, response.content)
            found = {str(i["id"]) for i in response.json()["items"]}
            self.assertEqual(found, ids, subject)

    def test_get_by_id_denied_returns_404(self):
        cases = [
            ("bc_owner", self.owner_bio, 404),
            ("bc_noroles", self.owner_obs, 404),
        ]
        for subject, activity, status in cases:
            response = self.get(subject, f"/{activity.id}")
            self.assertEqual(response.status_code, status, (subject, activity.type))

    def test_get_by_id_allowed(self):
        for subject, activity in [
            ("bc_owner", self.owner_obs),
            ("bc_owner", self.other_obs),
            ("bc_biocontrol", self.other_bio),
            ("bc_admin", self.other_bio),
            ("bc_master", self.owner_bio),
        ]:
            response = self.get(subject, f"/{activity.id}")
            self.assertEqual(response.status_code, 200, (subject, response.content))
            self.assertEqual(response.json()["data"]["id"], str(activity.id))

    def test_linked_activities_metadata_is_filtered(self):
        extra = Activity.objects.create(
            short_id="N9",
            type=ActivityType.Observation,
            subtype=self.owner_obs.subtype,
            date=datetime.date(2024, 1, 1),
            created_by="x",
            creating_user=self.owner_obs.creating_user,
            shape=GEOSGeometry("POINT(-123 49)", srid=4326),
        )
        linkers = [self.owner_bio, self.other_obs, extra]
        for a in linkers:
            a.linked_activities.add(self.owner_obs)
        expected = {
            "bc_admin": {str(a.id) for a in linkers},
            "bc_owner": {str(self.other_obs.id), str(extra.id)},
        }
        for subject, ids in expected.items():
            response = self.get(subject, f"/{self.owner_obs.id}")
            self.assertEqual(response.status_code, 200, response.content)
            linked = {
                str(i["activity_id"])
                for i in response.json()["metadata"]["linking_activities"]
            }
            self.assertEqual(linked, ids, subject)
