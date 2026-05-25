from django.test import Client
from api.tests.base_test_case import BaseTestCase
from . import parse_mvt_with_geometry
import json
from api.models.activity import Activity
from api.models.enums import ActivityType
from api.models.activity import ActivitySubtypes

CONTENT_TYPE = "application/vnd.mapbox-vector-tile"


class VectorTileTestCase(BaseTestCase):
    base_filter_object = json.dumps(
        {
            "recordSetType": "Activity",
            "selectColumns": [],
            "tableFilters": [],
        }
    )

    url_pattern = "/tiles/{}/{}/{}?filterObjects={}"

    fixtures = ["test/common/test_activities.json"]

    def setUp(self):
        self.client = Client()

    def get_tile(self, z: int, x: int, y: int, test_status: int, auth: bool = True):
        url = self.url_pattern.format(z, x, y, self.base_filter_object)
        headers = {"Authorization": "Bearer act_as_user=test_user"} if auth else {}
        response = self.client.get(
            url,
            headers=headers,
        )
        self.assertEqual(response.status_code, test_status)
        if 200 <= test_status <= 299:
            self.assertEqual(response.headers["Content-Type"], CONTENT_TYPE)
        return response

    def get_tile_coord_containing_zero_features(self):
        """Target known location where 0 features exist"""
        z = 12
        x = 2048
        y = 2047
        test_status = 204
        return self.get_tile(z, x, y, test_status)

    def get_tile_containing_centroid_features(self):
        """Returns tile above the Centroid Threshold, features are converted to centroids at this level."""
        z = 10
        x = 164
        y = 337
        test_status = 200
        return self.get_tile(z, x, y, test_status)

    def get_tile_containing_polygon_features(self):
        """Returns tile above the Centroid threshold (12), features remain in their original shapes at this level"""
        z = 12
        x = 657
        y = 1350
        test_status = 200
        return self.get_tile(z, x, y, test_status)

    def test_tile_endpoint_without_features(self):
        """Test the API properly handles requests where no features are found"""

        response = self.get_tile_coord_containing_zero_features()
        self.assertEqual(len(response.content), 0)

    def test_tile_endpoint_with_features(self):
        """Tests the API properly handles requests where features exist"""

        response = self.get_tile_containing_centroid_features()
        self.assertGreater(len(response.content), 0)

    def test_tile_features_are_centroids(self):
        """Tests that items below zoom level 12 are cast to centroids"""

        response = self.get_tile_containing_centroid_features()
        tile_layers = parse_mvt_with_geometry(response.content)
        self.assertEqual(len(tile_layers["data"]), 2)

        for feature in tile_layers["data"]:
            self.assertTrue(feature["geometry_type"], "Point")

    def test_tile_features_are_polygons(self):

        response = self.get_tile_containing_polygon_features()
        tile_layers = parse_mvt_with_geometry(response.content)
        self.assertEqual(len(tile_layers["data"]), 2)

        for feature in tile_layers["data"]:
            self.assertTrue(feature["geometry_type"], "Polygon")

    def test_feature_properties_in_tile(self):
        BASE = {
            "subtype": ActivitySubtypes.Observation_Plant_Terrestrial.name,
            "type": ActivityType.Observation,
        }
        EXPECTED_A = BASE | {
            "short_id": "26PTO6BBA2749",
            "id": "6bba2749-ee3d-41b6-a9f1-4a0cb37029f7",
            "map_symbol": "ACT, A",
        }
        EXPECTED_B = BASE | {
            "short_id": "26PTOCD542709",
            "id": "cd542709-f767-402f-818e-117b3fbc797d",
            "map_symbol": "ACT, B",
        }

        response = self.get_tile_containing_centroid_features()
        tile_layers = parse_mvt_with_geometry(response.content)

        self.assertEqual(len(tile_layers["data"]), 2)
        self.assertEqual(tile_layers["data"][0]["properties"], EXPECTED_A)
        self.assertEqual(tile_layers["data"][1]["properties"], EXPECTED_B)

    def test_new_activity_appears_in_tile(self):
        act = Activity.objects.create(
            type=ActivityType.Observation,
            subtype=ActivitySubtypes.Observation_Plant_Terrestrial.name,
            shape="SRID=4326;POLYGON ((-122.177141614583 52.1532521915262, -122.177829032404 52.1531151489405, -122.178253871019 52.1527563687912, -122.178253859939 52.1523128961334, -122.177829014477 52.1519541224493, -122.177141614583 52.1518170838594, -122.176454214689 52.1519541224493, -122.176029369227 52.1523128961334, -122.176029358147 52.1527563687912, -122.176454196762 52.1531151489405, -122.177141614583 52.1532521915262))",
            date="2026-01-01",
            computed_tile_shape="SRID=3857;POLYGON ((-13600697.19 6827882.99, -13600773.71 6827858.13, -13600821.01 6827793.03, -13600821.01 6827712.57, -13600773.71 6827647.48, -13600697.19 6827622.62, -13600620.67 6827647.48, -13600573.38 6827712.57, -13600573.38 6827793.03, -13600620.67 6827858.13, -13600697.19 6827882.99))",
            computed_map_symbol="ACT, C",
        )

        EXPECTED = {
            "type": ActivityType.Observation,
            "subtype": ActivitySubtypes.Observation_Plant_Terrestrial.name,
            "short_id": act.short_id,
            "id": str(act.id),
            "map_symbol": act.computed_map_symbol,
        }
        response = self.get_tile_containing_polygon_features()
        tile_layers = parse_mvt_with_geometry(response.content)

        self.assertEqual(len(tile_layers["data"]), 3)
        self.assertEqual(tile_layers["data"][2]["properties"], EXPECTED)

    def test_invalid_coordinates(self):
        """Invalid Coordinates"""
        self.get_tile(-10, 200, 32, 404)
        self.get_tile(10, -200, 32, 404)
        self.get_tile(-10, 200, -32, 404)
        self.get_tile(9999, 9999, 9999, 400)

    def test_unauthorized_access(self):
        z = 12
        x = 657
        y = 1350
        test_status = 403
        return self.get_tile(z, x, y, test_status, auth=False)

    def test_filtered_tile_request(self):
        """Set a filter object for a specific ID, verify only one item returned."""
        target = "26PTO6BBA2749"
        z = 12
        x = 657
        y = 1350
        filter_object = json.dumps(
            {
                "recordSetType": "Activity",
                "selectColumns": [],
                "tableFilters": [
                    {
                        "id": "2",
                        "field": "short_id",
                        "filterType": "tableFilter",
                        "operator": "CONTAINS",
                        "operator2": "AND",
                        "filter": target,
                    }
                ],
            }
        )

        url = self.url_pattern.format(z, x, y, filter_object)

        response = self.client.get(
            url,
            headers={"Authorization": "Bearer act_as_user=test_user"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], CONTENT_TYPE)

        tile_layers = parse_mvt_with_geometry(response.content)
        self.assertEqual(len(tile_layers["data"]), 1)

        for feature in tile_layers["data"]:
            self.assertTrue(feature["properties"]["short_id"], target)
