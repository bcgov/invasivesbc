import requests
from celery import shared_task
from celery.utils.log import get_task_logger
from api.models.activity import Activity, ActivityDataRecord, RisoArea
from django.db import transaction
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING
import psycopg
from psycopg.rows import dict_row

logger = get_task_logger(__name__)

BCGW_CONFIG = {
    "ownership": {
        "table_name": "WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW",  # BCGW table
        "target_attribute": "OWNER_TYPE",  # The attribute to collect
    },
    "computed_biogeoclimatic_zone": {
        "table_name": "WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY",
        "target_attribute": "BGC_LABEL",
    },
    "flrno_districts": {
        "table_name": "WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG",
        "target_attribute": "DISTRICT_NAME",
    },
    "moti_districts": {
        "table_name": "WHSE_ADMIN_BOUNDARIES.TADM_MOT_DISTRICT_BNDRY_POLY",
        "target_attribute": "DISTRICT_NAME",
    },
}


def query_bcgw(config_name, activity: Activity):
    WFS_URL = "https://openmaps.gov.bc.ca/geo/pub/wfs"
    WFS_PARAMS = "?service=WFS&version=1.1.0&request=GetFeature&typeName=pub:{layer}&outputFormat=json&maxFeatures=1&srsName=epsg:4326&bbox={bbox},epsg:4326"
    lat = activity.latitude
    long = activity.longitude

    config = BCGW_CONFIG.get(config_name, None)
    if config is None or lat is None or long is None:
        raise Exception("Insufficient data provided")

    bbox = f"{long},{lat},{long},{lat}"
    url = WFS_URL + WFS_PARAMS.format(layer=config["table_name"], bbox=bbox)
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    data = response.json()
    try:
        return data["features"][0]["properties"][config["target_attribute"]]
    except:
        return None


def fetch_computed_biogeoclimatic_zones(a: Activity):
    return query_bcgw("computed_biogeoclimatic_zone", a)


def fetch_computed_flrno_districts(a: Activity):
    return query_bcgw("flrno_districts", a)


def fetch_computed_ownership(a: Activity):
    return query_bcgw("ownership", a)


def fetch_computed_moti_districts(a: Activity):
    return query_bcgw("moti_districts", a)


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
        raise


def fetch_computed_invasive_plant_management_areas(a: Activity):
    # TODO: Port tables over and create unmanaged models
    wkt_shape = a.shape.wkt
    srid = a.shape.srid
    try:
        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                response = cursor.execute(
                    """
                    SELECT imp.ipma
                    FROM public.invasive_plant_management_areas imp
                    WHERE ST_INTERSECTS2(imp.geog, ST_GeomFromText(%s, %s)::geography)
                    LIMIT 1
                    """,
                    (wkt_shape, srid),
                )
                if cursor.rowcount == 0:
                    return None
                row = response.fetchone()
                return row["ipma"]
    except psycopg.Error as e:
        logger.error(e)
        raise


def fetch_computed_regional_districts(a: Activity):
    # TODO: Port tables over and create unmanaged models
    wkt_shape = a.shape.wkt
    srid = a.shape.srid
    try:
        with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                response = cursor.execute(
                    """
                    SELECT rd.agency
                    FROM public.regional_districts rd
                    WHERE ST_INTERSECTS2(rd.geog, ST_GeomFromText(%s, %s)::geography)
                    LIMIT 1
                    """,
                    (wkt_shape, srid),
                )
                if cursor.rowcount == 0:
                    return None
                row = response.fetchone()
                return row["agency"]
    except psycopg.Error as e:
        logger.error(e)


def fetch_computed_elevation_m(a: Activity):
    if a.latitude == None or a.longitude == None or a.computed_elevation_m != None:
        return
    url = f"https://geogratis.gc.ca/services/elevation/cdem/altitude?lat={a.latitude}&lon={a.longitude}"
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    data = response.json()
    return data["altitude"]


@shared_task(bind=True, max_retries=3)
def generate_computed_activity_fields(self, record_id):
    try:
        a = Activity.objects.get(id=record_id)
        a.computed_elevation_m = fetch_computed_elevation_m(a)
        a.computed_biogeoclimatic_zone = fetch_computed_biogeoclimatic_zones(a)
        a.computed_flrno_districts = fetch_computed_flrno_districts(a)
        a.computed_invasive_plant_management_areas = (
            fetch_computed_invasive_plant_management_areas(a)
        )
        a.computed_moti_districts = fetch_computed_moti_districts(a)
        a.computed_ownership = fetch_computed_ownership(a)
        a.computed_regional_districts = fetch_computed_regional_districts(a)
        risos = fetch_computed_riso_areas(a)
        with transaction.atomic():
            for agency in risos:
                already_exists = ActivityDataRecord.objects.filter(
                    activity=a,
                    risoarea__organization=agency,
                ).exists()
                if not already_exists:
                    logger.info(f"{agency} -- {str(risos)}")
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
