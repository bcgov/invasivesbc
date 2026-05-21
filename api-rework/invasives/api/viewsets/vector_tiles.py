from django.db.models import Aggregate, F, Func
from django.contrib.gis.db.models import GeometryField, BinaryField
from django.contrib.gis.db.models.functions import Centroid
from django.http import HttpResponse
import json
from rest_framework import viewsets
from rest_framework.decorators import action

from api.utils.filtered_activity_queryset import FilteredActivityQueryset

CENTROID_ZOOM_LIMIT = 12


class ST_TileEnvelope(Func):
    function = "ST_TileEnvelope"
    output_field = GeometryField(srid=3857)


class ST_AsMVTGeom(Func):
    function = "ST_AsMVTGeom"


class ST_AsMVT(Aggregate):
    function = "ST_AsMVT"
    output_field = BinaryField()
    template = "%(function)s((SELECT r FROM (SELECT %(expressions)s) r), 'data')"


class AsMapSymbol(Func):
    """Used to force computed_map_symbol to appear as map_symbol in the payload"""

    template = '%(expressions)s AS "map_symbol"'


class VectorTileViewset(viewsets.GenericViewSet):
    @action(
        detail=False,
        methods=["get"],
        url_path=r"(?P<zoom>\d+)/(?P<tile_x>\d+)/(?P<tile_y>\d+)",
    )
    def vector_tiles(self, request, zoom=None, tile_x=None, tile_y=None):
        z, x, y = int(zoom), int(tile_x), int(tile_y)

        raw_filters = request.GET.get("filterObjects", "")
        if not raw_filters:
            return HttpResponse(content="Bad Request", status=400)

        filter_objects = [json.loads(raw_filters)]

        activity_queryset = FilteredActivityQueryset(filter_objects).apply_filters()

        if not activity_queryset.exists():
            # Early Return, No results to share.
            return HttpResponse(status=204)

        tile_geom = ST_TileEnvelope(z, x, y)

        if z < CENTROID_ZOOM_LIMIT:
            target_geometry = Centroid(
                F("computed_tile_shape"), output_field=GeometryField(srid=3857)
            )
        else:
            target_geometry = F("computed_tile_shape")

        mvt_features = (
            activity_queryset.filter(computed_tile_shape__intersects=tile_geom)
            .values(
                "id",
                "short_id",
                "type",
                "subtype",
            )
            .annotate(
                mvt_geom=ST_AsMVTGeom(
                    target_geometry,
                    tile_geom,
                    4096,
                    64,
                    True,
                    output_field=BinaryField(),
                ),
                map_symbol=F("computed_map_symbol"),
            )
        )

        mvt_query = mvt_features.aggregate(
            tile_bytes=ST_AsMVT(
                F("id"),
                F("short_id"),
                F("type"),
                F("subtype"),
                F("mvt_geom"),
                AsMapSymbol("map_symbol"),
            )
        )
        tile_bytes = mvt_query.get("tile_bytes")

        if not tile_bytes:
            return HttpResponse(status=204)
        return HttpResponse(
            bytes(tile_bytes), content_type="application/vnd.mapbox-vector-tile"
        )
