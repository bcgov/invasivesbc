from api.models.activity import Activity, ActivityDataRecord, RisoArea
from celery.utils.log import get_task_logger
from django.db import transaction
from invasivesbc import celery_app
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING
import psycopg
from psycopg.rows import dict_row
import requests

logger = get_task_logger(__name__)

BCGW_CONFIG = {
    "WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW": {
        "related_key": "computed_ownership",  # DB Column
        "layer_name": "WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW",  # BCGW table
        "layer_property": "OWNER_TYPE",  # The attribute to collect
        "layer_geom": "SHAPE",  # Feature to match against in BCGW
    },
    "WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY": {
        "related_key": "computed_biogeoclimatic_zone",
        "layer_name": "WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY",
        "layer_property": "BGC_LABEL",
        "layer_geom": "GEOMETRY",
    },
    "WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG": {
        "related_key": "computed_flrno_districts",
        "layer_name": "WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG",
        "layer_property": "DISTRICT_NAME",
        "layer_geom": "SHAPE",
    },
    "WHSE_ADMIN_BOUNDARIES.TADM_MOT_DISTRICT_BNDRY_POLY": {
        "related_key": "computed_moti_districts",
        "layer_name": "WHSE_ADMIN_BOUNDARIES.TADM_MOT_DISTRICT_BNDRY_POLY",
        "layer_property": "DISTRICT_NAME",
        "layer_geom": "GEOMETRY",
    },
}


def build_xml_query(activity: Activity):
    """Build BCGW Query"""

    def node(layer_name: str, layer_property: str, layer_geom: str, activity: Activity):
        """
        Build out a subquery for our XML Request
        """
        return f"""
            <wfs:Query typeNames="pub:{layer_name}">
                <wfs:PropertyName>{layer_property}</wfs:PropertyName>
                <fes:Filter>
                <fes:Intersects>
                    <fes:ValueReference>{layer_geom}</fes:ValueReference>
                    <gml:Point srsName="urn:ogc:def:crs:EPSG::4326">
                    <gml:pos>{activity.latitude} {activity.longitude}</gml:pos>
                    </gml:Point>
                </fes:Intersects>
                </fes:Filter>
            </wfs:Query>
        """

    HEAD = """
        <wfs:GetFeature service="WFS" version="2.0.0" outputFormat="application/json"
        xmlns:wfs="http://www.opengis.net/wfs/2.0"
        xmlns:fes="http://www.opengis.net/fes/2.0"
        xmlns:gml="http://www.opengis.net/gml/3.2"
        xmlns:pub="http://openmaps.gov.bc.ca/">
    """
    TAIL = "</wfs:GetFeature>"

    query_nodes = "".join(
        node(
            layer_name=entry["layer_name"],
            layer_property=entry["layer_property"],
            layer_geom=entry["layer_geom"],
            activity=activity,
        )
        for entry in BCGW_CONFIG.values()
    )

    return f"{HEAD} {query_nodes} {TAIL}".encode("utf-8")


def query_bcgw(activity: Activity):
    """
    Query the BCGW with an Activities Shape to populat the following:
        - computed_ownership
        - computed_biogeoclimatic_zone
        - computed_flrno_districts
        - computed_moti_districts
    """
    if activity.shape is None:
        raise Exception("Insufficient data provided")

    xml = build_xml_query(activity=activity)
    headers = {"Content-Type": "text/xml"}
    WFS_URL = "https://openmaps.gov.bc.ca/geo/pub/wfs"
    response = requests.post(WFS_URL, data=xml, headers=headers, timeout=15)

    response.raise_for_status()
    data = response.json()
    for feature in data["features"]:
        """
        Convert Layer ID to base e.g.:
        WHSE_ADMIN_BOUNDARIES.TADM_MOT_DISTRICT_BNDRY_POLY.9 => WHSE_ADMIN_BOUNDARIES.TADM_MOT_DISTRICT_BNDRY_POLY
        """
        bcgw_layer_id = ".".join(str(feature["id"]).split(".")[:2])
        config = BCGW_CONFIG.get(bcgw_layer_id, None)
        if config != None:
            val = feature["properties"].get(config["layer_property"], None)
            setattr(activity, config["related_key"], val)


def fetch_computed_elevation_m(a: Activity):
    if a.latitude is None or a.longitude is None:
        raise Exception("latitude or longitude is missing, cannot compute elevation")

    url = f"https://geogratis.gc.ca/services/elevation/cdem/altitude?lat={a.latitude}&lon={a.longitude}"
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    data = response.json()
    a.computed_elevation_m = data.get("altitude", None)


def query_singleton_spatial_tables(a: Activity):
    """
    Assign Singleton computed values for Activity using a connection for multiple fields.
    Populates the computed values for:
        - computed_invasive_plant_management_areas
        - computed_regional_districts
    """
    wkt_shape = a.shape.wkt
    srid = a.shape.srid
    try:
        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                response = cursor.execute(
                    """
                    SELECT (
                        SELECT imp.ipma
                        FROM public.invasive_plant_management_areas imp
                        WHERE ST_INTERSECTS2(imp.geog, ST_GeomFromText(%s, %s)::geography)
                        LIMIT 1
                    ) as ipma,
                    (
                        SELECT rd.agency
                        FROM public.regional_districts rd
                        WHERE ST_INTERSECTS2(rd.geog, ST_GeomFromText(%s, %s)::geography)
                        LIMIT 1
                    ) as district
                    """,
                    (wkt_shape, srid, wkt_shape, srid),
                )
                if cursor.rowcount == 0:
                    return

                row = response.fetchone()

                ipma = row["ipma"] if row["ipma"] else None
                a.computed_invasive_plant_management_areas = ipma

                regional_districts = row["district"] if row["district"] else None
                a.computed_regional_districts = regional_districts
    except psycopg.Error as e:
        logger.error(e)
        raise e


def fetch_computed_riso_areas(a: Activity):
    # TODO: Port tables over and create unmanaged models
    wkt_shape = a.shape.wkt
    srid = a.shape.srid
    try:
        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                response = cursor.execute(
                    """
                    SELECT riso.agency
                    FROM public.regional_invasive_species_organization_areas riso
                    WHERE ST_INTERSECTS2(riso.geog, ST_GeomFromText(%s, %s)::geography)
                    """,
                    (wkt_shape, srid),
                )
                return [row["agency"] for row in response.fetchall()]
    except psycopg.Error as e:
        logger.error(f"fetch_computed_riso_areas failed: {e}")
        raise e


@celery_app.task(bind=True, max_retries=3)
def generate_computed_activity_fields(self, record_id):
    try:
        a = Activity.objects.get(id=record_id)
        fetch_computed_elevation_m(a)
        query_bcgw(a)
        query_singleton_spatial_tables(a)
        risos = fetch_computed_riso_areas(a)
        with transaction.atomic():
            for agency in risos:
                already_exists = ActivityDataRecord.objects.filter(
                    activity=a,
                    risoarea__organization=agency,
                ).exists()
                if not already_exists:
                    adr = ActivityDataRecord.objects.create(activity=a)
                    RisoArea.objects.create(
                        activity_data_record=adr, organization=agency
                    )

            a.computed_fields_generated = True
            a.save(
                update_fields=[
                    "computed_fields_generated",
                    "computed_elevation_m",
                    "computed_biogeoclimatic_zone",
                    "computed_flrno_districts",
                    "computed_invasive_plant_management_areas",
                    "computed_moti_districts",
                    "computed_ownership",
                    "computed_regional_districts",
                ]
            )

    except requests.RequestException as e:
        logger.error(e)
        raise self.retry(exc=e)
    except Activity.DoesNotExist:
        logger.warning(f"Activity {record_id} does not exist.")
    except Exception as e:
        logger.error(e)
        raise e
