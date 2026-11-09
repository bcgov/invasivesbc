from copy import deepcopy
from datetime import date, time
import re
from unittest.mock import MagicMock

from django.test import SimpleTestCase
from pydantic import TypeAdapter, ValidationError
from psycopg.rows import dict_row

from api.legacy_db.iapp_query import (
    IAPP_SITE_QUERY,
    fetch_iapp_site_rows,
)
from api.legacy_db.iapp_serializer import (
    LegacyIAPPBiologicalDispersal,
    LegacyIAPPBiologicalMonitoring,
    LegacyIAPPBiologicalTreatment,
    LegacyIAPPChemicalMonitoring,
    LegacyIAPPChemicalTreatment,
    LegacyIAPPMechanicalMonitoring,
    LegacyIAPPMechanicalTreatment,
    LegacyIAPPSite,
    LegacyIAPPSiteSelection,
    LegacyIAPPSurvey,
    YNFlag,
)


def site_attributes() -> dict:
    return {
        "site_id": 1,
        "site_paper_file_id": "SITE-1",
        "district_lot_number": None,
        "jurisdictions": "Provincial, Federal",
        "site_created_date": "2020-01-02",
        "mapsheet": "092G",
        "utm_zone": 10,
        "utm_easting": 500000,
        "utm_northing": 5500000,
        "decimal_latitude": 49.25,
        "decimal_longitude": -123.1,
        "biogeoclimatic_zone": "CWH",
        "sub_zone": "vm",
        "variant": None,
        "phase": None,
        "site_series": None,
        "soil_texture": None,
        "site_specific_use": "Agriculture",
        "invasive_plant": "Example plant",
        "site_location": None,
        "site_comments": None,
        "entered_by": "tester",
        "date_entered": "2020-01-03",
        "updated_by": "tester",
        "date_updated": "2020-01-04",
        "regional_district": None,
        "regional_invasive_species_organization": None,
        "invasive_plant_management_area": None,
        "protected": True,
    }


def site_selection() -> dict:
    return {
        **site_attributes(),
        "siteselectionid": 11,
        "survey_paper_file_id": None,
        "last_surveyed_date": "2020-01-05",
        "primary_surveyor": None,
        "other_surveyors": None,
        "estimated_area_hectares": 2.5,
        "distribution": None,
        "density": None,
        "slope_percent": None,
        "aspect": None,
        "elevation": None,
        "treatment_date": None,
        "treatment_type": None,
        "all_species_on_site": "Example plant, Other plant",
    }


def survey() -> dict:
    return {
        **site_attributes(),
        "site_created_date": None,
        "surveyid": 21,
        "survey_paper_file_id": "SURVEY-1",
        "survey_date": "2020-02-01",
        "survey_type": "Initial",
        "estimated_area_hectares": 2.5,
        "distribution": None,
        "density": None,
        "survey_agency": "Agency",
        "employer": None,
        "primary_surveyor": None,
        "other_surveyors": None,
        "survey_comments": None,
    }


def chemical_treatment() -> dict:
    return {
        **site_attributes(),
        "chemicaltreatmentid": 31,
        "service_licence_number": None,
        "pmp_number": "PMP-1",
        "pup_number": None,
        "treatment_date": "2020-03-01",
        "treatment_paper_file_id": None,
        "treatment_agency": "Agency",
        "treatment_comments": None,
        "herbicide": "Herbicide",
        "method": "Foliar",
        "area_treated_hectares": 1.2,
        "amount_of_mix_used_litres": 2.3,
        "application_rate_litres_per_hectare": 3.4,
        "delivery_rate_litres_per_hectare": 4,
        "dilution_percent": 5.6,
        "amount_of_undiluted_herbicide_used_litres": 7.8,
        "tank_mix": None,
        "application_time": "13:45:00",
        "temperature": 18,
        "wind_speed": 2,
        "wind_direction": 90,
        "humidity": 40,
        "employer": None,
        "primary_applicator": "applicator",
        "other_applicators": "helper",
    }


def chemical_monitoring() -> dict:
    return {
        **site_attributes(),
        "chemicalmonitoringid": 32,
        "service_licence_number": None,
        "pmp_number": "PMP-1",
        "pup_number": None,
        "herbicide": "Herbicide",
        "treatment_method": "Foliar",
        "treatment_date": None,
        "treatment_paper_file_id": None,
        "treatment_comments": None,
        "monitoring_paper_file_id": None,
        "monitoring_agency": "Agency",
        "inspection_date": "2020-04-01",
        "primary_surveyor": None,
        "other_surveyors": None,
        "efficacy_rating": "Good",
        "estimated_area_hectares": 2.0,
        "distribution": None,
        "density": None,
        "monitoring_comments": None,
    }


def mechanical_treatment() -> dict:
    return {
        **site_attributes(),
        "mechanicaltreatmentid": 33,
        "treatment_date": None,
        "treatment_paper_file_id": None,
        "treatment_agency": "Agency",
        "treatment_comments": None,
        "treatment_method": "Hand pull",
        "estimated_area_hectares": 2.0,
        "employer": None,
        "primary_applicator": "applicator",
        "other_applicators": None,
    }


def mechanical_monitoring() -> dict:
    return {
        **site_attributes(),
        "mechmonitoringid": 34,
        "treatment_method": "Hand pull",
        "treatment_date": None,
        "treatment_paper_file_id": None,
        "treatment_comments": None,
        "monitoring_paper_file_id": None,
        "monitoring_agency": "Agency",
        "inspection_date": "2020-04-02",
        "primary_surveyor": None,
        "other_surveyors": None,
        "efficacy_rating": "Good",
        "estimated_area_hectares": None,
        "distribution": None,
        "density": None,
        "monitoring_comments": None,
    }


def biological_treatment() -> dict:
    return {
        **site_attributes(),
        "biotreatmentid": 35,
        "estimated_area_hectares": 1.5,
        "distribution": None,
        "density": None,
        "treatment_date": None,
        "treatment_paper_file_id": None,
        "treatment_agency": "Agency",
        "treatment_comments": None,
        "release_quantity": 10,
        "bioagent_source": None,
        "biological_agent": "Agent",
        "employer": None,
        "collection_date": "2020-02-01",
        "agent_life_stage": "Adult",
        "release_time": "13:45:00",
        "primary_applicator": "applicator",
        "other_applicators": None,
        "release_utm_zone": None,
        "release_utm_easting": None,
        "release_utm_northing": None,
    }


def biological_flags() -> dict:
    return {
        "foliar_feeding_damage": "Y",
        "rootfeeding_damage": "N",
        "seedfeeding_damage": "Y",
        "oviposition_marks": "N",
        "eggs_present": "Y",
        "larvae_present": "N",
        "pupae_present": "Y",
        "adults_present": "N",
        "tunnels_present": "Y",
    }


def biological_monitoring() -> dict:
    return {
        **site_attributes(),
        "biologicalmonitoringid": 36,
        "biological_agent": "Agent",
        "treatment_date": None,
        "treatment_paper_file_id": None,
        "treatment_comments": None,
        "monitoring_paper_file_id": None,
        "monitoring_agency": "Agency",
        "inspection_date": None,
        "primary_surveyor": None,
        "other_surveyors": None,
        "agent_count": 1,
        "plant_count": 2,
        "count_duration": 3,
        "legacy_presence": "N",
        **biological_flags(),
        "estimated_area_hectares": 1.5,
        "distribution": None,
        "density": None,
        "monitoring_comments": None,
    }


def biological_dispersal() -> dict:
    return {
        **site_attributes(),
        "biologicaldispersalid": 37,
        "biological_agent": "Agent",
        "dispersal_paper_file_id": None,
        "dispersal_agency": None,
        "inspection_date": None,
        "agent_count": 1,
        "plant_count": 2,
        "count_duration": 3,
        **biological_flags(),
        "primary_surveyor": None,
        "other_surveyors": None,
        "dispersal_utm_zone": None,
        "dispersal_utm_easting": None,
        "dispersal_utm_northing": None,
        "estimated_area_hectares": 1.5,
        "distribution": None,
        "density": None,
        "monitoring_comments": None,
    }


def site_row() -> dict:
    return {
        "site_id": 1,
        "protected": True,
        "geometries": [
            {"type": "Point", "coordinates": [-123.1, 49.25]},
        ],
        "site_selections": [site_selection()],
        "surveys": [survey()],
        "chemical_treatments": [],
        "chemical_monitorings": [],
        "mechanical_treatments": [],
        "mechanical_monitorings": [],
        "biological_treatments": [],
        "biological_monitorings": [],
        "biological_dispersals": [],
    }


def full_site_row() -> dict:
    row = site_row()
    row["chemical_treatments"] = [chemical_treatment()]
    row["chemical_monitorings"] = [chemical_monitoring()]
    row["mechanical_treatments"] = [mechanical_treatment()]
    row["mechanical_monitorings"] = [mechanical_monitoring()]
    row["biological_treatments"] = [biological_treatment()]
    row["biological_monitorings"] = [biological_monitoring()]
    row["biological_dispersals"] = [biological_dispersal()]
    return row


class LegacyIAPPSerializerTests(SimpleTestCase):
    def test_query_output_aliases_match_site_model_fields(self):
        select_clause = IAPP_SITE_QUERY.rsplit("SELECT", 1)[1].split(
            "FROM sites AS s", 1
        )[0]
        aliases = re.findall(r"\bAS\s+([a-z_]+)", select_clause, re.IGNORECASE)

        self.assertEqual(len(aliases), len(set(aliases)))
        self.assertEqual(set(aliases), set(LegacyIAPPSite.model_fields))

    def test_fetch_rows_uses_named_cursor_and_stream_batch_size(self):
        conn = MagicMock()
        cursor = conn.cursor.return_value.__enter__.return_value
        row = {"site_id": 1}
        cursor.__iter__.return_value = iter([row])

        rows = list(fetch_iapp_site_rows(conn, site_ids=[1], itersize=23))

        self.assertEqual(rows, [row])
        conn.cursor.assert_called_once_with(name="iapp_site_rows", row_factory=dict_row)
        self.assertEqual(cursor.itersize, 23)
        cursor.execute.assert_called_once_with(IAPP_SITE_QUERY, {"site_ids": [1]})

    def test_site_with_selection_and_survey_parses(self):
        parsed = LegacyIAPPSite.model_validate(site_row())

        self.assertEqual(parsed.site_id, 1)
        self.assertEqual(parsed.site_selections[0].last_surveyed_date, date(2020, 1, 5))
        self.assertEqual(parsed.surveys[0].survey_date, date(2020, 2, 1))
        self.assertEqual(
            parsed.geometry,
            {"type": "Point", "coordinates": [-123.1, 49.25]},
        )
        self.assertTrue(parsed.protected)

    def test_extract_models_reject_unknown_and_missing_columns(self):
        for model, fixture in (
            (LegacyIAPPSiteSelection, site_selection()),
            (LegacyIAPPSurvey, survey()),
            (LegacyIAPPChemicalTreatment, chemical_treatment()),
            (LegacyIAPPChemicalMonitoring, chemical_monitoring()),
            (LegacyIAPPMechanicalTreatment, mechanical_treatment()),
            (LegacyIAPPMechanicalMonitoring, mechanical_monitoring()),
            (LegacyIAPPBiologicalTreatment, biological_treatment()),
            (LegacyIAPPBiologicalMonitoring, biological_monitoring()),
            (LegacyIAPPBiologicalDispersal, biological_dispersal()),
        ):
            with self.subTest(model=model.__name__, error="extra"):
                extra_column = deepcopy(fixture)
                extra_column["new_legacy_column"] = "unexpected"
                with self.assertRaises(ValidationError):
                    model.model_validate(extra_column)

            with self.subTest(model=model.__name__, error="missing"):
                missing_column = deepcopy(fixture)
                del missing_column["site_id"]
                with self.assertRaises(ValidationError):
                    model.model_validate(missing_column)

    def test_full_site_parses_every_extract(self):
        parsed = LegacyIAPPSite.model_validate(full_site_row())

        self.assertEqual(len(parsed.chemical_treatments), 1)
        self.assertEqual(parsed.chemical_treatments[0].application_time, time(13, 45))
        self.assertEqual(len(parsed.chemical_monitorings), 1)
        self.assertEqual(len(parsed.mechanical_treatments), 1)
        self.assertEqual(len(parsed.mechanical_monitorings), 1)
        self.assertEqual(len(parsed.biological_treatments), 1)
        self.assertEqual(parsed.biological_treatments[0].release_time, time(13, 45))
        self.assertEqual(len(parsed.biological_monitorings), 1)
        self.assertTrue(parsed.biological_monitorings[0].foliar_feeding_damage)
        self.assertFalse(parsed.biological_monitorings[0].legacy_presence)
        self.assertEqual(len(parsed.biological_dispersals), 1)

    def test_biological_flags_reject_unknown_values(self):
        row = full_site_row()
        row["biological_dispersals"][0]["tunnels_present"] = "U"

        with self.assertRaises(ValidationError):
            LegacyIAPPSite.model_validate(row)

    def test_nested_site_id_must_match_parent(self):
        row = site_row()
        row["surveys"][0]["site_id"] = 2

        with self.assertRaises(ValidationError):
            LegacyIAPPSite.model_validate(row)

    def test_out_of_range_coordinates_are_rejected(self):
        row = site_row()
        row["site_selections"][0]["decimal_latitude"] = 100

        with self.assertRaises(ValidationError):
            LegacyIAPPSite.model_validate(row)

    def test_site_requires_at_least_one_selection(self):
        row = site_row()
        row["site_selections"] = []

        with self.assertRaises(ValidationError):
            LegacyIAPPSite.model_validate(row)

    def test_site_rejects_multiple_geometries(self):
        row = site_row()
        row["geometries"].append({"type": "Point", "coordinates": [0, 0]})

        with self.assertRaises(ValidationError):
            LegacyIAPPSite.model_validate(row)

    def test_computed_lists_split_delimited_values(self):
        parsed = LegacyIAPPSite.model_validate(site_row())

        self.assertEqual(
            parsed.site_selections[0].jurisdictions_list,
            ["Provincial", "Federal"],
        )
        self.assertEqual(
            parsed.site_selections[0].all_species_on_site_list,
            ["Example plant", "Other plant"],
        )

    def test_geometry_is_none_when_no_geometry_exists(self):
        row = site_row()
        row["geometries"] = []
        row["surveys"] = []

        parsed = LegacyIAPPSite.model_validate(row)

        self.assertEqual(parsed.surveys, [])
        self.assertIsNone(parsed.geometry)

    def test_y_n_flag_accepts_only_y_and_n(self):
        flag = TypeAdapter(YNFlag)

        self.assertTrue(flag.validate_python("Y"))
        self.assertFalse(flag.validate_python("N"))
        with self.assertRaises(ValidationError):
            flag.validate_python("U")
