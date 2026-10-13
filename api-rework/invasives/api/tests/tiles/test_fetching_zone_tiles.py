from django.test import Client
from api.tests.base_test_case import BaseTestCase
from . import parse_mvt_with_geometry

CONTENT_TYPE = "application/vnd.mapbox-vector-tile"


class ZoneOfInterestTestCase(BaseTestCase):
    url_pattern = "/ninja/tiles/zone/{}/{}/{}"

    def setUp(self):
        self.client = Client()

    def get_tile(self, z: int, x: int, y: int, test_status: int, auth: bool = True):
        url = self.url_pattern.format(z, x, y)
        headers = {"Authorization": "Bearer act_as_user=bc_admin"} if auth else {}
        response = self.client.get(
            url,
            headers=headers,
        )
        self.assertEqual(response.status_code, test_status)
        if 200 <= test_status <= 299:
            self.assertEqual(response.headers["Content-Type"], CONTENT_TYPE)
        return response

    def test_feature_properties_in_tile(self):

        response = self.get_tile(z=12, x=657, y=1350, test_status=200)
        tile_layers = parse_mvt_with_geometry(response.content)
        self.assertGreaterEqual(len(tile_layers["data"]), 0)
        props = [tile["properties"] for tile in tile_layers["data"]]
        for prop in props:
            self.assertIsNotNone(prop.get("public_id"))
            self.assertIsNone(prop.get("id"))

    def test_invalid_coordinates(self):
        """Invalid Coordinates"""
        self.get_tile(-10, 200, 32, 400)
        self.get_tile(10, -200, 32, 400)
        self.get_tile(-10, 200, -32, 400)
        self.get_tile(9999, 9999, 9999, 400)

    def test_unauthorized_access(self):
        z = 12
        x = 657
        y = 1350
        test_status = 401
        return self.get_tile(z, x, y, test_status, auth=False)
