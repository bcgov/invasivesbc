from datetime import date, datetime, time, timezone
from decimal import Decimal

from api.legacy_db.iapp_serializer import LegacyIAPPSite
from api.legacy_db.migrate_iapp import (
    CHILD_MODELS,
    SITE_CHILD_LISTS,
    create_iapp_site,
    map_iapp_record_to_django,
    map_iapp_site_to_django,
    refresh_iapp_site,
    update_iapp_record_from_pydantic,
)
from api.models.iapp import (
    IAPPBiologicalDispersal,
    IAPPChemicalTreatment,
    IAPPImportedImage,
    IAPPSite,
    IAPPSiteSelection,
    IAPPSurvey,
)
from api.tests.test_iapp_serializer import full_site_row
from django.test import TestCase, override_settings


def full_site() -> LegacyIAPPSite:
    return LegacyIAPPSite.model_validate(full_site_row())


class IAPPModelParityTests(TestCase):
    def test_every_pydantic_field_has_a_model_field(self):
        for legacy_cls, model in CHILD_MODELS.items():
            for name in legacy_cls.model_fields:
                with self.subTest(legacy=legacy_cls.__name__, field=name):
                    model._meta.get_field(name)

    def test_every_model_column_is_populated_from_pydantic(self):
        for legacy_cls, model in CHILD_MODELS.items():
            fields = {f.attname for f in model._meta.concrete_fields} - {
                f.attname
                for f in [model._meta.get_field(n) for n in legacy_cls.model_fields]
            }
            with self.subTest(model=model.__name__):
                self.assertEqual(fields, set())

    def test_site_fields_are_covered(self):
        site_columns = {f.name for f in IAPPSite._meta.concrete_fields}
        self.assertEqual(site_columns, {"site_id", "protected", "geometry"})
        self.assertEqual(
            set(LegacyIAPPSite.model_fields),
            {"site_id", "protected", "geometries", *SITE_CHILD_LISTS},
        )


class IAPPRecordMappingTests(TestCase):
    def test_dates_are_copied_without_conversion(self):
        site = full_site()
        survey = map_iapp_record_to_django(site.surveys[0])
        self.assertIs(type(survey.survey_date), date)
        self.assertEqual(survey.survey_date, site.surveys[0].survey_date)
        self.assertEqual(survey.date_entered, date(2020, 1, 3))

    def test_times_stay_naive(self):
        treatment = map_iapp_record_to_django(full_site().chemical_treatments[0])
        self.assertEqual(treatment.application_time, time(13, 45))
        self.assertIsNone(treatment.application_time.tzinfo)

    def test_floats_become_exact_decimals(self):
        treatment = map_iapp_record_to_django(full_site().chemical_treatments[0])
        self.assertIsInstance(treatment.application_rate_litres_per_hectare, Decimal)
        self.assertEqual(
            treatment.application_rate_litres_per_hectare,
            Decimal(
                str(
                    full_site()
                    .chemical_treatments[0]
                    .application_rate_litres_per_hectare
                )
            ),
        )
        self.assertEqual(
            map_iapp_record_to_django(full_site().surveys[0]).decimal_latitude,
            Decimal("49.25"),
        )

    def test_imported_at_is_aware_utc(self):
        image = map_iapp_record_to_django(full_site().images[0])
        self.assertEqual(
            image.imported_at,
            datetime(2021, 1, 2, 3, 4, 5, 123456, tzinfo=timezone.utc),
        )
        self.assertEqual(image.mapped_site_id, 1)
        self.assertEqual(image.site_id, 0)

    def test_datetime_is_rejected_for_date_fields(self):
        survey = full_site().surveys[0]
        object.__setattr__(survey, "survey_date", datetime(2020, 1, 1, 23, 30))
        with self.assertRaises(TypeError):
            map_iapp_record_to_django(survey)

    def test_foreign_keys_use_pydantic_site_id(self):
        record = map_iapp_record_to_django(full_site().biological_dispersals[0])
        self.assertEqual(record.site_id, 1)
        self.assertEqual(
            record.biologicaldispersalid,
            full_site().biological_dispersals[0].biologicaldispersalid,
        )

    def test_update_reports_changed_fields_only(self):
        legacy = full_site().surveys[0]
        existing = map_iapp_record_to_django(legacy)
        self.assertEqual(update_iapp_record_from_pydantic(existing, legacy), [])

        changed = legacy.model_copy(
            update={"survey_agency": "Other", "survey_date": date(2021, 2, 3)}
        )
        self.assertEqual(
            sorted(update_iapp_record_from_pydantic(existing, changed)),
            ["survey_agency", "survey_date"],
        )
        self.assertEqual(existing.survey_date, date(2021, 2, 3))

    def test_wrong_model_is_rejected(self):
        with self.assertRaises(TypeError):
            update_iapp_record_from_pydantic(
                IAPPSurvey(), full_site().site_selections[0]
            )

    def test_site_geometry_mapping(self):
        site = map_iapp_site_to_django(full_site())
        self.assertEqual(site.site_id, 1)
        self.assertTrue(site.protected)
        self.assertEqual(site.geometry.srid, 4326)
        self.assertEqual(tuple(site.geometry.coords), (-123.1, 49.25))

        row = full_site_row()
        row["geometries"] = []
        self.assertIsNone(
            map_iapp_site_to_django(LegacyIAPPSite.model_validate(row)).geometry
        )


# A zone far from UTC must not shift calendar dates.
@override_settings(TIME_ZONE="America/Vancouver")
class IAPPSiteSaveTests(TestCase):
    def test_create_persists_all_rows_and_dates_round_trip(self):
        create_iapp_site(full_site())

        site = IAPPSite.objects.get(pk=1)
        self.assertEqual(site.site_selections.count(), 1)
        self.assertEqual(site.surveys.count(), 1)
        self.assertEqual(site.chemical_treatments.count(), 1)
        self.assertEqual(site.biological_dispersals.count(), 1)
        self.assertEqual(site.images.count(), 1)
        self.assertEqual(site.geometry.srid, 4326)

        survey = IAPPSurvey.objects.get()
        self.assertEqual(survey.survey_date, full_site().surveys[0].survey_date)
        self.assertEqual(survey.date_entered, date(2020, 1, 3))
        treatment = IAPPChemicalTreatment.objects.get()
        self.assertEqual(treatment.application_time, time(13, 45))
        self.assertEqual(
            IAPPImportedImage.objects.get().imported_at,
            datetime(2021, 1, 2, 3, 4, 5, 123456, tzinfo=timezone.utc),
        )
        self.assertTrue(IAPPBiologicalDispersal.objects.get().foliar_feeding_damage)

    def test_create_rejects_existing_site(self):
        create_iapp_site(full_site())
        with self.assertRaises(Exception):
            create_iapp_site(full_site())

    def test_refresh_creates_missing_site(self):
        refresh_iapp_site(full_site())
        self.assertTrue(IAPPSite.objects.filter(pk=1).exists())

    def test_refresh_updates_inserts_and_deletes(self):
        create_iapp_site(full_site())

        row = full_site_row()
        row["protected"] = False
        row["geometries"] = [{"type": "Point", "coordinates": [-120.0, 50.0]}]
        row["surveys"][0]["survey_agency"] = "Changed"
        row["surveys"][0]["survey_date"] = "2022-03-04"
        second = dict(row["surveys"][0], surveyid=500)
        row["surveys"].append(second)
        row["chemical_treatments"] = []
        row["images"][0]["comments"] = "new comment"
        refresh_iapp_site(LegacyIAPPSite.model_validate(row))

        site = IAPPSite.objects.get(pk=1)
        self.assertFalse(site.protected)
        self.assertEqual(tuple(site.geometry.coords), (-120.0, 50.0))
        self.assertEqual(
            sorted(IAPPSurvey.objects.values_list("surveyid", flat=True)),
            sorted([row["surveys"][0]["surveyid"], 500]),
        )
        survey = IAPPSurvey.objects.get(pk=row["surveys"][0]["surveyid"])
        self.assertEqual(survey.survey_agency, "Changed")
        self.assertEqual(survey.survey_date, date(2022, 3, 4))
        self.assertEqual(IAPPChemicalTreatment.objects.count(), 0)
        self.assertEqual(IAPPImportedImage.objects.get().comments, "new comment")
        self.assertEqual(IAPPSiteSelection.objects.count(), 1)

    def test_refresh_with_identical_data_is_idempotent(self):
        create_iapp_site(full_site())
        refresh_iapp_site(full_site())
        self.assertEqual(IAPPSite.objects.count(), 1)
        self.assertEqual(IAPPSurvey.objects.count(), 1)
