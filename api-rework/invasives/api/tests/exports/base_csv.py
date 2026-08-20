from django.test.client import Client
from api.tests.base_test_case import BaseTestCase
from api.models.activity import ActivitySubtypes
from asgiref.sync import async_to_sync
from io import StringIO
import csv
from api.configs.exports import CSV_SUBTYPE_CONFIG, build_csv_annotation_object


class BaseCSVTest(BaseTestCase):
    target_row = "ID"
    HEADERS = 0
    FIRST = 1

    def setUp(
        self, subtype: ActivitySubtypes, filter_id: str, number_expected_entries: int
    ):
        """
        Setup the Test suite for the inheriting class
         :subtype: Activity Subtype to filter
         :filter_id: Specific Short ID of a record to filter on, to ensure filtering logic works as intended
         :expected_unfiltered_rows: The total number of entries that are expected to appear in an entry.
                                    Generally this is 1 row per entry, but records like chemical treatments
                                    can contain different numbers based on the combination of jurisdiction/plant/herbicide
        """
        self.number_expected_entries = number_expected_entries
        self.set_annotations(subtype)
        self.set_filters(subtype, filter_id)
        self.client = Client()

    def set_annotations(self, subtype: ActivitySubtypes):
        """
        Iterate the chosen subtype for the Annotations belonging to an export.
        """
        config = CSV_SUBTYPE_CONFIG.get(subtype)
        self.subtype_annotations = config["annotations"]
        self.assertIsNotNone(self.subtype_annotations)
        full_annotation = build_csv_annotation_object(self.subtype_annotations)

        self.CSV_HEADERS = [a["header"] for a in full_annotation]
        self.assertIsNotNone(self.CSV_HEADERS)

    def set_filters(self, subtype, filter_id):
        """
        Preset the filters for the request with the expected CSV Type, and the Record ID we will filter on
        """
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
        """
        Request the CSV from target endpoint with given params.
         :filter: Request the CSV using the supplied filters (filter on record id)
         :auth: Request the CSV as an authenticated user (unauthenticated users will be denied)
        """
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

        # Helper function to consume the async stream
        async def get_stream_content():
            chunks = []
            async for chunk in response.streaming_content:
                if isinstance(chunk, bytes):
                    chunks.append(chunk.decode("utf-8"))
                else:
                    chunks.append(chunk)
            return "".join(chunks)

        # Consume the async generator synchronously
        content = async_to_sync(get_stream_content)()
        csv_file = StringIO(content)
        reader = csv.reader(csv_file)
        rows = list(reader)

        # Test the Headers match what is expected from the configuration.
        self.assertEqual(self.CSV_HEADERS, rows[0])

        return rows

    def verify_subtype_columns_populate(self):
        """
        Parse the entries in the CSV and ensure that for each annotation header, at least one row will populate each column
        *Not all records will fill every column*
        Pass Requirements:
         - For every annotation, at least one row has an entry.
        """
        sub_headers = [anno["header"] for anno in self.subtype_annotations]
        rows = self.get_csv()
        populated_headers = set()
        for row in rows[1:]:
            for header in sub_headers:
                idx = rows[self.HEADERS].index(header)
                if row[idx] != None:
                    populated_headers.add(header)
        missing_fields = set(sub_headers) - populated_headers
        self.assertEqual(
            len(missing_fields),
            0,
            f"The Following fields had nothing populated: {missing_fields}",
        )

    def verify_unfiltered_csv(self):
        """
        Request CSV Using no added filters.
        Generally there is 1 row per plant entry. In some cases there are more (chemical treatments)
        Pass Requirements:
         - Number of rows equals expected values
        """
        rows = self.get_csv()
        # Entries + 1 row for Headers.
        expected_value = 1 + self.number_expected_entries
        self.assertEqual(len(rows), expected_value)

    def verify_csv_filters(self):
        """
        Request CSV using filter on ID.
        Pass Requirements:
         - Minimum one Entry is returned
         - All entries have the same ID as the filter.
        """
        rows = self.get_csv(filter=True)

        self.assertGreaterEqual(len(rows), 2)  # 1 Header, 1 Row (minimum)
        for row in rows[1:]:
            targ_index = rows[self.HEADERS].index("ID")
            self.assertEqual(row[targ_index], self.filter_id)
