import json, asyncio
from ninja import Router
from django.db.models import Aggregate, F, Func
from django.contrib.gis.db.models import GeometryField, BinaryField
from django.contrib.gis.db.models.functions import PointOnSurface
from django.http import HttpResponse
from django.contrib.gis.db.models.functions import Transform

from api.ninja_authentication import NinjaKeycloakAuthentication
from api.utils.filtered_activity_queryset import FilteredActivityQueryset
from api.models.mapping import ZoneOfInterest

CENTROID_ZOOM_LIMIT = 12
CONTENT_TYPE = "application/vnd.mapbox-vector-tile"

router = Router(auth=NinjaKeycloakAuthentication())


class ST_TileEnvelope(Func):
    function = "ST_TileEnvelope"
    output_field = GeometryField(srid=3857)


class ST_AsMVTGeom(Func):
    function = "ST_AsMVTGeom"


class ST_AsMVT(Aggregate):
    function = "ST_AsMVT"
    output_field = BinaryField()
    template = "%(function)s((SELECT r FROM (SELECT %(expressions)s) r), 'data')"


class AsColumn(Func):
    def __init__(self, expression, alias, **extra):
        super().__init__(expression, **extra)
        self.template = f'%(expressions)s AS "{alias}"'


@router.get("/activity/{z}/{x}/{y}")
async def req_activity_vector_tile(request, z: int, x: int, y: int):
    try:
        raw_filters = request.GET.get("filterObjects", "")
        if not raw_filters:
            return HttpResponse(content="Bad Request", status=400)

        max_tile = 2**z
        if z < 0 or z > 24:
            return HttpResponse(
                {"error": "Zoom level out of bounds (0-24)."},
                content_type=CONTENT_TYPE,
                status=400,
            )

        if x < 0 or x >= max_tile or y < 0 or y >= max_tile:
            return HttpResponse(
                {"error": f"Tile X/Y coordinates out of bounds for zoom {z}."},
                content_type=CONTENT_TYPE,
                status=400,
            )

        filter_objects = [json.loads(raw_filters)]
        activity_queryset = FilteredActivityQueryset(filter_objects).apply_filters()

        if not await activity_queryset.aexists():
            return HttpResponse(status=204, content_type=CONTENT_TYPE)

        tile_geom = ST_TileEnvelope(z, x, y)

        if z < CENTROID_ZOOM_LIMIT:
            target_geometry = PointOnSurface(
                F("computed_tile_shape"), output_field=GeometryField(srid=3857)
            )
        else:
            target_geometry = F("computed_tile_shape")

        mvt_features = (
            activity_queryset.filter(computed_tile_shape__intersects=tile_geom)
            .values("id", "short_id", "type", "subtype")
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

        mvt_query = await mvt_features.aaggregate(
            tile_bytes=ST_AsMVT(
                AsColumn("id", "id"),
                AsColumn("short_id", "short_id"),
                AsColumn("type", "type"),
                AsColumn("subtype", "subtype"),
                AsColumn("mvt_geom", "mvt_geom"),
                AsColumn("map_symbol", "map_symbol"),
            )
        )
        tile_bytes = mvt_query.get("tile_bytes")

        if not tile_bytes:
            return HttpResponse(status=204, content_type=CONTENT_TYPE)
        return HttpResponse(bytes(tile_bytes), content_type=CONTENT_TYPE)

    except asyncio.CancelledError:
        raise


@router.get("/zone/{z}/{x}/{y}")
async def zone_vector_tile(request, z: int, x: int, y: int):
    try:
        if not (0 <= z <= 24) or not (0 <= x < 2**z) or not (0 <= y < 2**z):
            return HttpResponse(status=400)

        tile_3857 = ST_TileEnvelope(z, x, y)
        tile_3005 = Transform(tile_3857, 3005)

        result = await ZoneOfInterest.objects.filter(
            shape__intersects=tile_3005
        ).aaggregate(
            tile=ST_AsMVT(
                AsColumn("public_id", "public_id"),
                AsColumn(
                    ST_AsMVTGeom(Transform("shape", 3857), tile_3857, 4096, 64, True),
                    "geom",
                ),
            )
        )

        tile = result["tile"]
        if not tile:
            return HttpResponse(status=204)
        return HttpResponse(bytes(tile), content_type=CONTENT_TYPE)

    except asyncio.CancelledError:
        raise
