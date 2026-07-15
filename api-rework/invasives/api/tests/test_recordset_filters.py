from .base_test_case import BaseTestCase
import json
from django.test.client import Client
from django.contrib.gis.geos import GEOSGeometry
from api.models.activity import ActivitySubtypes, ActivityType
from pydantic import TypeAdapter
from api.schemas.plant_activity import ACTIVITY_PROCESSORS
from api.protocol.activity.plant_subtypes.union_definition import PlantActivitySchema
from api.tests.mock_frontend_submissions import (
    UPDATED_TERRESTRIAL_OBSERVATION,
    UPDATED_AQUATIC_OBSERVATION,
    UPDATED_CHEM_TREATMENT_TERRESTRIAL,
    UPDATED_CHEM_TREATMENT_AQUATIC,
    UPDATED_MECH_TREATMENT_AQUATIC,
    UPDATED_MECH_TREATMENT_TERRESTRIAL,
    UPDATED_BIOCONTROL_RELEASE,
    UPDATED_BIOCONTROL_COLLECTION,
    UPDATED_BIOCONTROL_DISPERSAL_MONITORING,
    UPDATED_BIOCONTROL_RELEASE_MONITORING,
    UPDATED_CHEM_TREATMENT_MONITORING,
    UPDATED_MONITORING_MECH_TREATMENT,
)

adapter = TypeAdapter(PlantActivitySchema)
NOT = "DOES NOT CONTAIN"
TOTAL_NUM_RECORDS = 12 + 2  # 12 Subtype records + 2 from Observation Fixtures

mocks = [
    UPDATED_TERRESTRIAL_OBSERVATION,
    UPDATED_AQUATIC_OBSERVATION,
    UPDATED_CHEM_TREATMENT_TERRESTRIAL,
    UPDATED_CHEM_TREATMENT_AQUATIC,
    UPDATED_MECH_TREATMENT_AQUATIC,
    UPDATED_MECH_TREATMENT_TERRESTRIAL,
    UPDATED_BIOCONTROL_RELEASE,
    UPDATED_BIOCONTROL_COLLECTION,
    UPDATED_BIOCONTROL_DISPERSAL_MONITORING,
    UPDATED_BIOCONTROL_RELEASE_MONITORING,
    UPDATED_CHEM_TREATMENT_MONITORING,
    UPDATED_MONITORING_MECH_TREATMENT,
]


class ActivityRecordsetFilterTest(BaseTestCase):
    single_filter_test_cases = {
        "short_id": {
            "has": {
                "expected_num_records": 1,
                "value": "26PTOF7E4A0B3",
            },
            "not_has": {
                "expected_num_records": 13,
                "value": "26PTOF7E4A0B3",
            },
            "partial": {
                "expected_num_records": 3,
                "value": "PTO",
            },
        },
        "activity_type": {
            "has": {
                "expected_num_records": 4,
                "value": "Observation",
            },
            "not_has": {
                "expected_num_records": 11,
                "value": ActivityType.Monitoring.value,
            },
            "partial": {
                "expected_num_records": 9,
                "value": "a",
            },
        },
        "activity_subtype": {
            "has": {
                "expected_num_records": 3,
                "value": ActivitySubtypes.Observation_Plant_Terrestrial.readableFormat,
            },
            "not_has": {
                "expected_num_records": 11,
                "value": ActivitySubtypes.Observation_Plant_Terrestrial.readableFormat,
            },
            "partial": {
                "expected_num_records": 4,
                "value": "Observation",
            },
        },
        "activity_date": {
            "has": {
                "expected_num_records": 12,
                "value": "2026",
            },
            "not_has": {
                "expected_num_records": 2,
                "value": "-06-",
            },
        },
        "project_code": {
            "has": {
                "expected_num_records": 1,
                "value": "Beacon Hill Area",
            },
            "not_has": {
                "expected_num_records": 4,
                "value": "Description",
            },
            "partial": {
                "expected_num_records": 1,
                "value": "Code",
            },
        },
        "jurisdiction_display": {
            "has": {
                "expected_num_records": 5,
                "value": "Ministry of Transportation and Transit",
            },
            "not_has": {
                "expected_num_records": 8,
                "value": "Other Rail",
            },
        },
        "invasive_plant": {
            "has": {
                "expected_num_records": 12,
                "value": "Japanese Knotweed",
            },
            "not_has": {
                "expected_num_records": 2,
                "value": "Japanese Knotweed",
            },
        },
        "species_positive_full": {
            "has": {
                "expected_num_records": 1,
                "value": "Common Tansy",
            },
            "not_has": {
                "expected_num_records": 13,
                "value": "Common Tansy",
            },
        },
        "species_negative_full": {
            "has": {
                "expected_num_records": 2,
                "value": "Japanese Knotweed",
            },
            "not_has": {
                "expected_num_records": 12,
                "value": "Japanese Knotweed",
            },
        },
        "species_treated_full": {
            "has": {
                "expected_num_records": 8,
                "value": "Japanese Knotweed",
            },
            "not_has": {
                "expected_num_records": 6,
                "value": "Japanese Knotweed",
            },
        },
        "species_biocontrol_full": {
            "has": {
                "expected_num_records": 4,
                "value": "APHAITA",
            },
            "not_has": {
                "expected_num_records": 10,
                "value": "APHAITA",
            },
        },
        "created_by": {
            "has": {
                "expected_num_records": 13,
                "value": "johnsmith@identifier",
            },
            "not_has": {
                "expected_num_records": 13,
                "value": "janedoe@identifier",
            },
            "partial": {
                "expected_num_records": 14,
                "value": "@identifier",
            },
        },
        "updated_by": {
            "has": {
                "expected_num_records": 13,
                "value": "johnsmith@identifier",
            },
            "not_has": {
                "expected_num_records": 1,
                "value": "johnsmith@identifier",
            },
            "partial": {
                "expected_num_records": 1,
                "value": "janedoe",
            },
        },
        "agency": {
            "has": {
                "expected_num_records": 13,
                "value": "Ministry of Transportation and Transit",
            },
            "not_has": {
                "expected_num_records": 1,
                "value": "Ministry of Transportation and Transit",
            },
        },
    }
    fixtures = [
        "test/common/test_invasive_plant_codes",
        "test/subtypes/biocontrol/test_biocontrol_codes",
        "test/subtypes/treatments/test_mechanical_treatment_codes",
        "test/subtypes/treatments/test_chemical_treatment_codes",
        "test/subtypes/observations/test_terrestrial_observation_codes",
        "test/subtypes/observations/test_aquatic_observation_codes",
        "test/subtypes/monitoring/test_chem_mech_treatment_monitoring_codes",
        "test/subtypes/monitoring/test_biocontrol_release_monitoring_codes",
        "test/subtypes/treatments/test_biocontrol_release_codes",
        "test/common/test_chemical_treatments.json",
        "test/common/test_employer",
        "test/common/test_jurisdictions",
        "test/common/test_funding_agency",
        "test/common/test_waterlevel_management",
        "test/common/test_wind",
        "test/common/test_waterbody_substrate",
        "test/common/test_participants",
        "test/common/test_nearest_wells",
        "test/common/test_waterbody_type",
        "test/subtypes/observations/test_terrestrial_observation",
    ]

    def rule(
        self,
        field: str,
        filter: str,
        operator: str = "CONTAINS",
        operator2: str = "AND",
    ):
        return {
            "field": field,
            "filter": filter,
            "filterType": "tableFilter",
            "operator": operator,
            "operator2": operator2,
        }

    def create_filter_objects(self, rules):
        return {
            "filterObjects": [
                {
                    "limit": 20,
                    "page": 0,
                    "recordSetType": "Activity",
                    "selectColumns": [],
                    "tableFilters": rules,
                }
            ]
        }

    def fetch_rows(self, rules=[]):
        payload = self.create_filter_objects(rules=rules)
        client = Client()
        res = client.post(
            f"/recordset/rows",
            headers={"Authorization": "Bearer act_as_user=test_user"},
            content_type="application/json",
            data=payload,
        )
        self.assertEqual(res.status_code, 200)
        response_data = res.json()
        return response_data

    def setUpTestData():
        """
        Load in the different subtypes so we have something to filter against
        """
        for mock in mocks:
            schema_instance = adapter.validate_python(mock)
            parsed = schema_instance.model_dump(mode="python", exclude_unset=True)
            shape_data = parsed.get("shape", None)

            if shape_data:
                geometry_dict = shape_data.get("geometry", shape_data)
                parsed["shape"] = GEOSGeometry(json.dumps(geometry_dict))
            parsed["type"] = ActivitySubtypes[parsed["subtype"]].typeOfActivity
            subtype = parsed.get("subtype")
            processor = ACTIVITY_PROCESSORS.get(subtype)
            processor.process(payload=parsed)

    def test_no_filter(self):
        response = self.fetch_rows(rules=[])
        self.assertEqual(len(response), TOTAL_NUM_RECORDS)

    def test_single_filter(self):
        def run_checks(column: str, config: dict, does_contain: bool = True):
            # Build Request, get rows
            search_filter: str = config.get("value")
            rules = [
                self.rule(
                    filter=search_filter,
                    field=column,
                    operator="CONTAINS" if does_contain else "DOES NOT CONTAIN",
                )
            ]
            results = self.fetch_rows(rules=rules)

            num_returned: int = len(results)
            num_expected: int = config.get("expected_num_records", None)

            # Check Results returned are equal to expectations
            self.assertEqual(
                num_returned,
                num_expected,
                f"\nNumber of results did not match expectation,\n"
                f"Received: {num_returned}, Expected: {num_expected}.\n"
                f'Filtering on table column: "{column}", with value: "{search_filter}"\n'
                f'Does contain?: {"Yes" if does_contain else "No"}',
            )

            for result in results:

                received_value: str = result.get(column, None)
                if does_contain:
                    self.assertIn(
                        search_filter.casefold(),
                        received_value.casefold(),
                        f'\nFiltering on table column: "{column}", with value: "{search_filter}"\n'
                        f'Does contain?: {"Yes" if does_contain else "No"}',
                    )
                # DOES NOT CONTAIN & Not Null
                elif not does_contain and received_value != None:
                    self.assertNotIn(
                        search_filter.casefold(),
                        received_value.casefold(),
                        f'\nFiltering on table column: "{column}", with value: "{search_filter}"\n'
                        f'Does contain?: {"Yes" if does_contain else "No"}\n',
                    )

        for key, value in self.single_filter_test_cases.items():
            if has := value.get("has", None):
                run_checks(column=key, config=has)
            if not_has := value.get("not_has", None):
                run_checks(column=key, config=not_has, does_contain=False)
            if partial := value.get("partial", None):
                run_checks(column=key, config=partial)

    def test_two_contains_filter(self):
        pass  # IMPLEMENT

    def test_one_contains_one_not_contains_filter(self):
        pass  # IMPLEMENT

    def test_two_not_contains_filter(self):
        pass  # IMPLEMENT
