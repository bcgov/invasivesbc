from decimal import Decimal

from api.constants import WellKnownRoles
from api.legacy_db.iapp_serializer import LegacyIAPPSite
from api.legacy_db.migrate_iapp import create_iapp_site
from api.models import Role, User
from api.serializers.iapp import IAPP_RECORD_TYPES
from api.tests.test_iapp_serializer import full_site_row
from django.test import TestCase, override_settings
from rest_framework.test import APIClient


@override_settings(UNIT_TESTING_ENABLED=True)
class IAPPViewSetTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        for role in WellKnownRoles:
            Role.objects.get_or_create(name=role.value)
        cls.admin = User.objects.create(subject="iapp_admin")
        cls.admin.roles.add(WellKnownRoles.ADMINISTRATOR.value)
        cls.other = User.objects.create(subject="iapp_data_manager")
        cls.other.roles.add(WellKnownRoles.DATA_MANAGER.value)
        cls.site = create_iapp_site(LegacyIAPPSite.model_validate(full_site_row()))

    def client_for(self, user=None):
        client = APIClient()
        if user:
            client.force_authenticate(user=user)
        return client

    def test_list_is_shallow(self):
        response = self.client_for(self.admin).get("/iapp")
        self.assertEqual(response.status_code, 200, response.content)
        results = response.json()["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(
            set(results[0]),
            {
                "site_id",
                "survey_date",
                "species",
                "record_type",
                "latitude",
                "longitude",
            },
        )
        selection = self.site.site_selections.first()
        self.assertEqual(results[0]["site_id"], self.site.site_id)
        self.assertEqual(results[0]["species"], selection.invasive_plant)
        self.assertEqual(Decimal(results[0]["latitude"]), selection.decimal_latitude)
        self.assertEqual(
            results[0]["survey_date"],
            self.site.surveys.first().survey_date.isoformat(),
        )

    def test_record_type_lists_sorted_types(self):
        results = self.client_for(self.admin).get("/iapp").json()["results"]
        self.assertEqual(
            results[0]["record_type"],
            ", ".join(sorted(IAPP_RECORD_TYPES)),
        )

    def test_record_type_single(self):
        for related in IAPP_RECORD_TYPES.values():
            if related != "chemical_treatments":
                getattr(self.site, related).all().delete()
        results = self.client_for(self.admin).get("/iapp").json()["results"]
        self.assertEqual(results[0]["record_type"], "chemical_treatment")

    def test_record_type_unknown_without_records(self):
        for related in IAPP_RECORD_TYPES.values():
            getattr(self.site, related).all().delete()
        results = self.client_for(self.admin).get("/iapp").json()["results"]
        self.assertEqual(results[0]["record_type"], "Unknown")

    def test_detail_is_deep(self):
        response = self.client_for(self.admin).get(f"/iapp/{self.site.site_id}")
        self.assertEqual(response.status_code, 200, response.content)
        body = response.json()
        for key in (
            "site_selections",
            "surveys",
            "chemical_treatments",
            "chemical_monitorings",
            "mechanical_treatments",
            "mechanical_monitorings",
            "biological_treatments",
            "biological_monitorings",
            "biological_dispersals",
            "images",
        ):
            self.assertIn(key, body)
        self.assertEqual(len(body["surveys"]), 1)
        self.assertEqual(len(body["images"]), 1)
        self.assertEqual(body["geometry"]["type"], self.site.geometry.geom_type)

    def test_detail_missing_is_404(self):
        response = self.client_for(self.admin).get("/iapp/999999")
        self.assertEqual(response.status_code, 404)

    def test_non_admin_forbidden(self):
        self.assertEqual(self.client_for(self.other).get("/iapp").status_code, 403)
        self.assertEqual(
            self.client_for(self.other).get(f"/iapp/{self.site.site_id}").status_code,
            403,
        )

    def test_anonymous_rejected(self):
        self.assertIn(self.client_for().get("/iapp").status_code, (401, 403))

    def test_writes_not_allowed(self):
        client = self.client_for(self.admin)
        url = f"/iapp/{self.site.site_id}"
        self.assertEqual(client.post("/iapp", {}, format="json").status_code, 405)
        self.assertEqual(client.put(url, {}, format="json").status_code, 405)
        self.assertEqual(client.patch(url, {}, format="json").status_code, 405)
        self.assertEqual(client.delete(url).status_code, 405)
