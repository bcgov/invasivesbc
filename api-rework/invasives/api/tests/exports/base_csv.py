from django.test.client import Client
from api.tests.base_test_case import BaseTestCase
from api.models.activity import ActivitySubtypes
from io import StringIO
import csv
from api.configs.exports import CSV_SUBTYPE_CONFIG, build_csv_annotation_object


class BaseCSVTest(BaseTestCase):
    target_row = "ID"
    HEADERS = 0
    FIRST = 1

    def setUp(self, subtype: ActivitySubtypes, filter_id: str):
        """Prepare the generic template for CSV Response"""
        self.set_annotations(subtype)
        self.set_filters(subtype, filter_id)
        self.client = Client()

    def set_annotations(self, subtype):
        """Build Annotation for the inheriting subtype"""
        config = CSV_SUBTYPE_CONFIG.get(subtype)
        annotations = config["annotations"]
        self.assertIsNotNone(annotations)
        full_annotation = build_csv_annotation_object(annotations)

        self.CSV_HEADERS = [a["header"] for a in full_annotation]
        self.assertIsNotNone(self.CSV_HEADERS)

    def set_filters(self, subtype, filter_id):
        self.NO_FILTER = {
            "filterObjects": [
                {
                    "recordSetType": "Activity",
                    "CSVType": subtype,
                    "tableFilters": [],
                    "selectColumns": [],
                }
            ]
        }
        self.FILTER = {
            "filterObjects": [
                {
                    "recordSetType": "Activity",
                    "CSVType": subtype,
                    "tableFilters": [
                        {
                            "id": "2TAmyk3ETaNhsau5lFOW2",
                            "field": "short_id",
                            "filterType": "tableFilter",
                            "operator": "CONTAINS",
                            "operator2": "AND",
                            "filter": filter_id,
                        }
                    ],
                    "selectColumns": [],
                }
            ]
        }

    def get_csv(self, filter: bool = False, auth=True):
        auth = {"Authorization": "Bearer act_as_user=test_user"} if auth else None
        filter = self.FILTER if filter else self.NO_FILTER
        response = self.client.post(
            "/recordset/csv", headers=auth, content_type="application/json", data=filter
        )

        if not auth:
            self.assertEqual(response.status_code, 403)
            return

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/csv")
        self.assertIn("attachment", response["Content-Disposition"])

        content = b"".join(response.streaming_content).decode("utf-8")
        csv_file = StringIO(content)
        reader = csv.reader(csv_file)
        rows = list(reader)

        # Test the Headers match what is expected from the configuration.
        self.assertEqual(self.CSV_HEADERS, rows[0])

        return rows
