from rest_framework import serializers
from django.contrib.gis.geos import Polygon, Point
import json


class PolygonSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return json.loads(instance.geojson)

    def to_internal_value(self, data):
        return Polygon(data["coordinates"][0])


class CentroidSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return json.loads(Point(x=instance.centroid.x, y=instance.centroid.y).geojson)
