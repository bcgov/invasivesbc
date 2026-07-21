from .base_test_case import BaseTestCase
import json, re
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

TOTAL_NUM_RECORDS = len(mocks)
NOT_OPERAND = "DOES NOT CONTAIN"

adapter = TypeAdapter(PlantActivitySchema)


class ActivityRecordsetFilterTest(BaseTestCase):
    """
    In depth test suite for Filtering Activities.

    Tests:
    - Every individual filter by itself (CONTAINS/NOT CONTAINS)
    - Combination of 2 Filters expressions
        - CONTAINS/CONTAINS
        - CONTAINS/NOT CONTAINS
        - NOT CONTAINS/NOT CONTAINS
    - Sort order works correctly
    - No duplicate records are being returned.

    Uses:
        Sample size of 14 records.
    """

    single_filter_test_cases = {
        "short_id": {
            "has": {
                "expected_num_records": 1,
                "value": "26PTOF7E4A0B3",
            },
            "not_has": {
                "expected_num_records": 11,
                "value": "PTO",
            },
        },
        "activity_type": {
            "has": {
                "expected_num_records": 2,
                "value": "Observation",
            },
            "not_has": {
                "expected_num_records": 9,
                "value": ActivityType.Monitoring.value,
            },
            "partial": {
                "expected_num_records": 7,
                "value": "a",
            },
        },
        "activity_subtype": {
            "has": {
                "expected_num_records": 1,
                "value": ActivitySubtypes.Observation_Plant_Terrestrial.readableFormat,
            },
            "not_has": {
                "expected_num_records": 11,
                "value": ActivitySubtypes.Observation_Plant_Terrestrial.readableFormat,
            },
            "partial": {
                "expected_num_records": 2,
                "value": "Observation",
            },
        },
        "activity_date": {
            "has": {
                "expected_num_records": 12,
                "value": "2026",
            },
            "not_has": {
                "expected_num_records": 8,
                "value": "-06-09",
            },
        },
        "project_code": {
            "has": {
                "expected_num_records": 1,
                "value": "Beacon Hill Area",
            },
            "not_has": {
                "expected_num_records": 2,
                "value": "Description",
            },
            "partial": {
                "expected_num_records": 1,
                "value": "Code",
            },
        },
        "jurisdiction_display": {
            "has": {
                "expected_num_records": 4,
                "value": "Ministry of Transportation and Transit",
            },
            "not_has": {
                "expected_num_records": 7,
                "value": "Other Rail",
            },
        },
        "invasive_plant": {
            "has": {
                "expected_num_records": 10,
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
                "expected_num_records": 11,
                "value": "Common Tansy",
            },
        },
        "species_negative_full": {
            "has": {
                "expected_num_records": 2,
                "value": "Japanese Knotweed",
            },
            "not_has": {
                "expected_num_records": 10,
                "value": "Japanese Knotweed",
            },
        },
        "species_treated_full": {
            "has": {
                "expected_num_records": 8,
                "value": "Japanese Knotweed",
            },
            "not_has": {
                "expected_num_records": 4,
                "value": "Japanese Knotweed",
            },
        },
        "species_biocontrol_full": {
            "has": {
                "expected_num_records": 4,
                "value": "APHAITA",
            },
            "not_has": {
                "expected_num_records": 8,
                "value": "APHAITA",
            },
        },
        "created_by": {
            "has": {
                "expected_num_records": 12,
                "value": "johnsmith@identifier",
            },
            "not_has": {
                "expected_num_records": 0,
                "value": "johnsmith@identifier",
            },
        },
        "updated_by": {
            "has": {
                "expected_num_records": 12,
                "value": "johnsmith@identifier",
            },
            "not_has": {
                "expected_num_records": 0,
                "value": "johnsmith@identifier",
            },
        },
        "agency": {
            "has": {
                "expected_num_records": 12,
                "value": "Ministry of Transportation and Transit",
            },
            "not_has": {
                "expected_num_records": 0,
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
        "test/common/test_chemical_treatments_codes",
        "test/common/test_employer_codes",
        "test/common/test_jurisdictions_codes",
        "test/common/test_funding_agency_codes",
        "test/common/test_waterlevel_management_codes",
        "test/common/test_wind_codes",
        "test/common/test_waterbody_type_codes",
        "test/common/test_waterbody_substrate_codes",
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

    def create_filter_objects(
        self, rules, sort_column: str = None, sort_order: str = None
    ):
        return {
            "filterObjects": [
                {
                    "limit": 20,
                    "page": 0,
                    "recordSetType": "Activity",
                    "selectColumns": [],
                    "tableFilters": rules,
                    **({"sortColumn": sort_column} if sort_column else {}),
                    **({"sortOrder": sort_order} if sort_order else {}),
                }
            ],
        }

    def fetch_rows(self, rules=[], sort_column: str = None, sort_order: str = None):
        payload = self.create_filter_objects(
            rules=rules,
            sort_column=sort_column,
            sort_order=sort_order,
        )
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
        records = self.fetch_rows(rules=[])
        self.assertEqual(len(records), TOTAL_NUM_RECORDS)
        self.assertEqual(
            len(set(activity["activity_id"] for activity in records)),
            len(records),
            "Duplicate IDs were found in the results.",
        )

    def test_single_filter(self):
        """
        Filter every available (non-computed) Column with Contains/Does Not Contain and partial matching.
        Expect:
            - Results [do not] contain filtered value
            - No duplicate activities present
        """

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

            self.assertEqual(
                len(set(activity["activity_id"] for activity in results)),
                num_expected,
                "Duplicate IDs were found in the results.",
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
        """
        Expect:
            - Filtering two 'CONTAINS' filters returns results
            - 5 Results are returned
            - All results returned contain the features defined in the rule.
            - No Duplicate Activities are present
        """
        COLUMN_ONE = "invasive_plant"
        COLUMN_ONE_VALUE = "Japanese Knotweed"
        COLUMN_TWO = "activity_date"
        COLUMN_TWO_VALUE = "2026-06-08"
        EXPECTED_RESULTS = 5
        records = self.fetch_rows(
            rules=[
                self.rule(field=COLUMN_ONE, filter=COLUMN_ONE_VALUE),
                self.rule(field=COLUMN_TWO, filter=COLUMN_TWO_VALUE),
            ]
        )
        self.assertEqual(len(records), EXPECTED_RESULTS)
        self.assertEqual(
            len(set(activity["activity_id"] for activity in records)),
            EXPECTED_RESULTS,
            "Duplicate IDs were found in the results.",
        )
        for record in records:
            self.assertIn(COLUMN_ONE_VALUE, record.get(COLUMN_ONE))
            self.assertIn(COLUMN_TWO_VALUE, record.get(COLUMN_TWO))

    def test_one_contains_one_not_contains_filter(self):
        """
        Expect:
            - Filtering one 'DOES NOT CONTAIN' and one 'CONTAINS' filter returns results
            - 2 Results are returned
            - All Record contain the values defined in our 'CONTAINS' rule
            - All records lack the values defined in our 'DOES NOT CONTAIN' rule.
            - No Duplicate IDs are found in the results
        """
        COLUMN_ONE = "invasive_plant"
        COLUMN_ONE_VALUE = "Japanese Knotweed"
        COLUMN_TWO = "activity_date"
        COLUMN_TWO_VALUE = "2026-06-08"
        EXPECTED_RESULTS = 2
        records = self.fetch_rows(
            rules=[
                self.rule(field=COLUMN_TWO, filter=COLUMN_TWO_VALUE),
                self.rule(
                    field=COLUMN_ONE, filter=COLUMN_ONE_VALUE, operator=NOT_OPERAND
                ),
            ]
        )
        self.assertEqual(len(records), EXPECTED_RESULTS)
        self.assertEqual(
            len(set(activity["activity_id"] for activity in records)),
            EXPECTED_RESULTS,
            "Duplicate IDs were found in the results.",
        )
        for record in records:
            if plant := record.get(COLUMN_ONE):
                self.assertNotIn(COLUMN_ONE_VALUE, plant)
            self.assertIn(COLUMN_TWO_VALUE, record.get(COLUMN_TWO))

    def test_two_not_contains_filter(self):
        """
        Expect:
            - Filtering two 'DOES NOT CONTAIN' filters returns results
            - 8 Results are returned
            - All results returned lack the values defined in the rules.
        """
        COLUMN_ONE = "activity_type"
        COLUMN_ONE_VALUE = "Treatment"
        COLUMN_TWO = "activity_date"
        COLUMN_TWO_VALUE = "2026-06-04"
        EXPECTED_RESULTS = 6
        records = self.fetch_rows(
            rules=[
                self.rule(
                    field=COLUMN_TWO, filter=COLUMN_TWO_VALUE, operator=NOT_OPERAND
                ),
                self.rule(
                    field=COLUMN_ONE,
                    filter=COLUMN_ONE_VALUE,
                    operator=NOT_OPERAND,
                ),
            ]
        )

        self.assertEqual(len(records), EXPECTED_RESULTS)
        self.assertEqual(
            len(set(activity["activity_id"] for activity in records)),
            EXPECTED_RESULTS,
            "Duplicate IDs were found in the results.",
        )
        for record in records:
            if plant := record.get(COLUMN_ONE):
                self.assertNotIn(COLUMN_ONE_VALUE, plant)
            if subtype := record.get(COLUMN_TWO):
                self.assertNotIn(COLUMN_TWO_VALUE, subtype)

    import re


def test_order_by(self):
    """
    Test ordering all columns by Asc/Desc
    Expect:
        - Results Sorted
        - No duplicate entries found
    """
    one_to_many_relations = [
        "project_code",
        "jurisdiction_display",
        "invasive_plant",
        "species_positive_full",
        "species_negative_full",
        "has_current_positive",
        "has_current_negative",
        "species_treated_full",
        "species_biocontrol_full",
        "agency",
        "regional_invasive_species_organization_areas",
    ]

    def is_sorted_asc(lst: list) -> bool:
        """Check list for proper ASC order, Nulls/empty strings last."""

        terminals = (None, "")
        return all(
            (lst[i + 1] in terminals)
            or (lst[i] not in terminals and lst[i] <= lst[i + 1])
            for i in range(len(lst) - 1)
        )

    def is_sorted_desc(lst: list) -> bool:
        """Check list for proper DESC order, Nulls/empty strings last."""
        terminals = (None, "")
        return all(
            (lst[i + 1] in terminals)
            or (lst[i] not in terminals and lst[i] >= lst[i + 1])
            for i in range(len(lst) - 1)
        )

    COLUMN_KEYS = self.single_filter_test_cases.keys()

    # Check each column in ASC/Desc order.
    for column in COLUMN_KEYS:
        for order in ["ASC", "DESC"]:

            records = self.fetch_rows(rules=[], sort_column=column, sort_order=order)
            # No filters are applied, so all records should be returned without duplicates
            self.assertEqual(
                len(records),
                TOTAL_NUM_RECORDS,
                "An incorrect number of records were returned. Duplicate ID's may be present"
                f"Returned: {[record["short_id"] for record in records].join(", ")}",
            )

            column_values = []
            for activity in records:
                raw_val = activity[column]

                if raw_val is None or raw_val == "":
                    column_values.append(None)
                    continue

                if column == "jurisdiction_display":
                    """
                    Handle jurisdictions (Split list -> Strip spaces -> Remove (%) -> Sort -> Get First element)
                    e.g. "Rail Other (66%), BC Rail (34%)" becomes "BC Rail"
                    """
                    parts = [p.strip() for p in str(raw_val).split(",") if p.strip()]
                    cleaned_parts = [
                        re.sub(r"\s*\(\d+%\)$", "", part) for part in parts
                    ]
                    first_val = sorted(cleaned_parts)[0] if cleaned_parts else None
                    column_values.append(first_val)

                elif column in one_to_many_relations:
                    """
                    Handle any one-to-many fields (Split list -> Strip spaces -> Sort -> Get First Element)
                    Same as jurisdictions but without the extra regex clean
                    """
                    parts = [p.strip() for p in str(raw_val).split(",") if p.strip()]
                    first_val = sorted(parts)[0] if parts else None
                    column_values.append(first_val)

                else:
                    column_values.append(raw_val)

            if order == "ASC":
                self.assertTrue(
                    is_sorted_asc(column_values),
                    "Entries were not returned in ascending order.\n"
                    f"Sorting on column: {column}\n"
                    f"Received: {str(column_values)}",
                )
            else:
                self.assertTrue(
                    is_sorted_desc(column_values),
                    "Entries were not returned in descending order.\n"
                    f"Sorting on column: {column}\n"
                    f"Received: {str(column_values)}",
                )
