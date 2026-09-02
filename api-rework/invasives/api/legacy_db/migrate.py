from decimal import Decimal, ROUND_DOWN
import json
import logging
from pprint import pformat
from zoneinfo import ZoneInfo

from pydantic_core._pydantic_core import ValidationError

from api.legacy_db.mappings.biocontrol import (
    add_subtype_payload_for_biocontrol_collection,
    add_subtype_payload_for_biocontrol_dispersal_monitoring_terrestrial_plant,
    add_subtype_payload_for_biocontrol_release,
    add_subtype_payload_for_biocontrol_release_monitoring_terrestrial_plant,
)
from api.legacy_db.mappings.chemical import (
    add_subtype_payload_for_plant_aquatic_chemical_treatment,
    add_subtype_payload_for_plant_terrestrial_chemical_treatment,
)
from api.legacy_db.mappings.mechanical_treatment import (
    add_subtype_payload_for_plant_aquatic_treatment,
    add_subtype_payload_for_plant_terrestrial_treatment,
)
from api.legacy_db.mappings.monitoring import (
    add_subtype_payload_for_plant_chemical_monitoring,
    add_subtype_payload_for_plant_mechanical_monitoring,
)
from api.legacy_db.mappings.plants import (
    add_subtype_payload_for_plant_aquatic_observation,
    add_subtype_payload_for_plant_terrestrial_observation,
)
from api.legacy_db.migration_errors import MigrationErrors
from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    ActivitySubtypes,
    Employer,
    FundingAgency,
    Jurisdiction,
    ProjectCode,
)
from api.models.codes import (
    EmployerCode,
    FundingAgencyCode,
    JurisdictionCode,
)
from api.models.enums import PlatformSource
from api.models.migrator import (
    ActivityMigrationStatus,
    ActivityPendingLink,
    MigrationError,
)
from api.utils.utm_coordinates import point_to_utm
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import DatabaseError, transaction
from django.utils import timezone
import geojson
from geojson import Feature, FeatureCollection
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING
import psycopg
from psycopg.rows import dict_row
import pyproj
import shapely
from shapely import Point, from_wkt, point_on_surface
from shapely.geometry import mapping

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("psycopg").setLevel(logging.DEBUG)

log = logging.getLogger("legacy-import")


def add_subtype_payload(new: Activity, old: LegacyActivity) -> None:

    match old.activity_payload.activity_subtype:
        case ActivitySubtypes.Observation_Plant_Terrestrial:
            add_subtype_payload_for_plant_terrestrial_observation(new, old)
        case ActivitySubtypes.Observation_Plant_Aquatic:
            add_subtype_payload_for_plant_aquatic_observation(new, old)
        case ActivitySubtypes.Biocontrol_Release:
            add_subtype_payload_for_biocontrol_release(new, old)
        case ActivitySubtypes.Biocontrol_Collection:
            add_subtype_payload_for_biocontrol_collection(new, old)
        case ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial:
            add_subtype_payload_for_biocontrol_dispersal_monitoring_terrestrial_plant(
                new, old
            )
        case ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial:
            add_subtype_payload_for_biocontrol_release_monitoring_terrestrial_plant(
                new, old
            )
        case ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial:
            add_subtype_payload_for_plant_terrestrial_treatment(new, old)
        case ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic:
            add_subtype_payload_for_plant_aquatic_treatment(new, old)
        case ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic:
            add_subtype_payload_for_plant_mechanical_monitoring(new, old)
        case ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic:
            add_subtype_payload_for_plant_chemical_monitoring(new, old)
        case ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial:
            add_subtype_payload_for_plant_terrestrial_chemical_treatment(new, old)
        case ActivitySubtypes.Treatment_Chemical_Plant_Aquatic:
            add_subtype_payload_for_plant_aquatic_chemical_treatment(new, old)
        case _:
            pass


def map_pydantic_model_to_django_model(old: LegacyActivity) -> Activity:
    new = Activity()
    new.id = old.activity_id
    new.short_id = old.activity_payload.short_id
    new.type = old.activity_type.name
    new.subtype = old.activity_subtype.name
    new.access_description = (
        old.activity_payload.form_data.activity_data.access_description
    )
    new.location_description = (
        old.activity_payload.form_data.activity_data.location_description
    )
    new.date = old.activity_payload.form_data.activity_data.activity_date_time
    new.form_status = old.form_status
    new.comment = old.activity_payload.form_data.activity_data.general_comment

    if old.activity_payload.geometry is None:
        logging.warning("geometry is null -- this is almost certainly an error")
        if (
            old.activity_payload.form_data.activity_data.latitude is not None
            and old.activity_payload.form_data.activity_data.longitude is not None
        ):
            if new.migration_remarks is None:
                new.migration_remarks = ""
            new.migration_remarks += f"Source activity has a null geometry field, but does have lat and long specified. Creating a zero-radius point geometry as a placeholder.\n\n"
            logging.warning(
                "activity coordinates exist, using as zero-radius point geometry"
            )
            new.shape = json.dumps(
                {
                    "type": "Point",
                    "coordinates": [
                        old.activity_payload.form_data.activity_data.longitude,
                        old.activity_payload.form_data.activity_data.latitude,
                    ],
                }
            )

    elif len(old.activity_payload.geometry) > 1:
        if new.migration_remarks is None:
            new.migration_remarks = ""

        logging.warning(
            "geometry contains multiple objects, attempting union_all (will result in polygon or multipolygon, situationally)"
        )

        new.migration_remarks += "geometry contains multiple objects, attempting union_all (will result in polygon or multipolygon, situationally)\n\n"

        if any(
            [
                shape["geometry"]["type"] != "Polygon"
                for shape in old.activity_payload.geometry
            ]
        ):
            logging.error(
                "at least one array element in a geometry list is not a polygon, cannot attempt conversion to multipolygon. geo: "
                + pformat(old.activity_payload.geometry)
            )
        else:
            final_shape = shapely.union_all(
                [
                    shapely.geometry.shape(shape["geometry"])
                    for shape in old.activity_payload.geometry
                ]
            )
            final_geojson = geojson.Feature(geometry=final_shape, properties={})
            logging.info("looks ok, proceeding with conversion attempt")
            logging.info("final shape: " + pformat(final_geojson))
            new.shape = json.dumps(final_geojson.geometry)
            warning_message = f"final geometry {final_geojson} created from sources: {[geojson.Feature(shapely.geometry.shape(shape["geometry"])) for shape in old.activity_payload.geometry]}\n\nTHIS SHOULD BE HAND-VERIFIED!"
            logging.warning(warning_message)
            new.migration_remarks += warning_message + "\n\n"

    else:
        new.shape = json.dumps((old.activity_payload.geometry[0]["geometry"]))
        properties = (
            old.activity_payload.geometry[0]["properties"]
            if "properties" in old.activity_payload.geometry[0]
            else None
        )
        if properties and "radius" in properties:
            logging.debug(f"Mapping radius: {properties['radius']}")
            new.shape_radius = Decimal(properties["radius"]).quantize(
                Decimal("0.0000000000000001"), rounding=ROUND_DOWN
            )

    new.created_by = old.activity_payload.created_by
    src_map = {
        "web": PlatformSource.Web.value,
        "ios": PlatformSource.Ios.value,
        "android": PlatformSource.Android.value,
    }

    new.creating_platform = src_map.get(
        old.activity_payload.platform_src, PlatformSource.Unknown.value
    )
    new.batch_id = old.batch_id
    new.batch_row_id = old.row_number

    if old.created_timestamp is not None:
        new.created_timestamp = timezone.make_aware(
            old.created_timestamp, ZoneInfo("America/Vancouver")
        )
        log.debug(f"importing with creation time {new.created_timestamp}")

    if old.received_timestamp is not None:
        new.received_timestamp = timezone.make_aware(
            old.received_timestamp, ZoneInfo("America/Vancouver")
        )

    if old.deleted_timestamp is not None:
        new.deleted_timestamp = timezone.make_aware(
            old.deleted_timestamp, ZoneInfo("America/Vancouver")
        )

    new.area_m = old.activity_payload.form_data.activity_data.reported_area

    coordinate_update_message = "During data migration, activity coordinates (both longitude/latitude and UTM coordinates) will updated to use a new method of computing a representative point on the defined shape."

    # this is the original value stored in the legacy activity. it is probably a centroid.
    original_point = Point(
        (
            old.activity_payload.form_data.activity_data.longitude,
            old.activity_payload.form_data.activity_data.latitude,
        )
    )

    # compute a better point to represent the geometry using point_on_surface
    shape = from_wkt(new.shape.wkt)
    representative_point: shapely.Point = point_on_surface(shape)

    # figure out how far it is from the original point in meters
    to_pseudo_mercator = pyproj.Transformer.from_crs(
        "EPSG:4326", "EPSG:3857", always_xy=True
    ).transform

    cartesian_distance_meters = shapely.distance(
        shapely.transform(representative_point, to_pseudo_mercator, interleaved=False),
        shapely.transform(original_point, to_pseudo_mercator, interleaved=False),
    )

    coordinate_update_message += f"\nCoordinates ({original_point.y}, {original_point.x}) => ({representative_point.y}, {representative_point.x}) (shifted {round(cartesian_distance_meters, 2)} meters)"

    if cartesian_distance_meters > 100:  # arbitrary threshold
        coordinate_update_message += "\nLarge change in representative point position, verification is recommended."
        logging.warning(
            f"Activity {new.id} coordinates significant change ({cartesian_distance_meters} meters). Suggest manual verification"
        )

    # build a geojson object containing both original and new point, for inclusion in the update remarks to aid in verification
    diagnostic_geojson = FeatureCollection(
        [
            Feature(geometry=mapping(shape), properties={"name": "Shape"}),
            Feature(
                geometry=mapping(original_point),
                properties={
                    "name": "Original Coordinates",
                    "marker-color": "rgba(255, 0, 0, 1)",
                },
            ),
            Feature(
                geometry=mapping(representative_point),
                properties={
                    "name": "Updated Coordinates",
                    "marker-color": "rgba(0, 255, 0, 1)",
                },
            ),
        ]
    )

    # now compute utm zone and coordinates based on the new point
    recomputed_utm_coordinates = point_to_utm(representative_point)

    if (
        recomputed_utm_coordinates.zone
        != old.activity_payload.form_data.activity_data.utm_zone
    ):
        coordinate_update_message += f"\nUTM Zone changed from {old.activity_payload.form_data.activity_data.utm_zone} to {recomputed_utm_coordinates.zone}"
        logging.error(
            "The UTM Zone for this activity changed (it is possibly it was near a boundary and the representative point update caused the change, but manual verification is recommended)!"
        )

    coordinate_update_message += (
        f"\nUTM Coordinates (Zone {old.activity_payload.form_data.activity_data.utm_zone} {old.activity_payload.form_data.activity_data.utm_easting}E {old.activity_payload.form_data.activity_data.utm_northing}N) => "
        f"(Zone {recomputed_utm_coordinates.zone} {recomputed_utm_coordinates.easting}E {recomputed_utm_coordinates.northing}N)"
    )
    if new.migration_remarks is None:
        new.migration_remarks = ""

    new.migration_remarks += coordinate_update_message

    new.migration_remarks += "\nDiagnostic GeoJSON for the coordinate change is here (for use with a GeoJSON Viewer). Contains the shape and both new and old coordinates (old in red, new in green, if your viewer supports `marker-color`)"
    new.migration_remarks += f"\n{diagnostic_geojson}"

    # update the object with the recomputed point, discarding the legacy version
    new.utm_zone = recomputed_utm_coordinates.zone
    new.utm_easting = recomputed_utm_coordinates.easting
    new.utm_northing = recomputed_utm_coordinates.northing

    new.latitude = round(Decimal(representative_point.y), 7)
    new.longitude = round(Decimal(representative_point.x), 7)

    try:
        new.full_clean()
        new.save()
    except ValidationError as e:
        # handled in the caller
        raise

    if old.activity_payload.form_data.activity_data.jurisdictions:
        adr = ActivityDataRecord.objects.create(activity=new)
        for jurisdiction in old.activity_payload.form_data.activity_data.jurisdictions:
            jur_code = JurisdictionCode.objects.filter(
                code=jurisdiction.jurisdiction_code
            ).first()
            if not jur_code:
                logging.warning(
                    f"No matching jurisdiction code found for {jurisdiction.jurisdiction_code}"
                )
                raise ValueError(
                    f"No matching jurisdiction code found for {jurisdiction.jurisdiction_code}"
                )
            Jurisdiction.objects.create(
                jurisdiction=jur_code,
                activity_data_record=adr,
                percent_covered=jurisdiction.percent_covered,
            )

    if old.activity_payload.form_data.activity_data.project_code:
        for project_code in old.activity_payload.form_data.activity_data.project_code:
            adr = ActivityDataRecord.objects.create(activity=new)
            if project_code.description is not None:
                ProjectCode.objects.create(
                    description=project_code.description, activity_data_record=adr
                )

    if old.activity_payload.form_data.activity_data.employer_code:
        found_code = EmployerCode.objects.filter(
            code=old.activity_payload.form_data.activity_data.employer_code
        ).first()
        if not found_code:
            logging.warning(
                f"No matching employer code found for {old.activity_payload.form_data.activity_data.employer_code}"
            )
            raise ValueError(
                f"No matching employer code found for {old.activity_payload.form_data.activity_data.employer_code}"
            )
        adr = ActivityDataRecord.objects.create(activity=new)
        Employer.objects.create(activity_data_record=adr, employer=found_code)

    try:
        new.full_clean()
        new.save()
    except ValidationError as e:
        logging.error(
            "validation error after base activity codes mapped", exc_info=True
        )
        raise

    if old.activity_payload.form_data.activity_data.invasive_species_agency_code:
        codes = old.activity_payload.form_data.activity_data.invasive_species_agency_code.split(
            ","
        )
        adr = ActivityDataRecord.objects.create(activity=new)

        for ag in codes:
            found_code = FundingAgencyCode.objects.filter(code=ag).first()
            if not found_code:
                logging.warning(f"No matching funding agency code found for {ag}")
                raise ValueError(f"No matching funding agency code found for {ag}")

            FundingAgency.objects.update_or_create(
                activity_data_record=adr, agency=found_code
            )

    try:
        add_subtype_payload(new, old)
        new.full_clean()
        new.save()
    except ValidationError as e:
        logging.error("validation error after subtype data mapped", exc_info=True)
        raise
    except DatabaseError as e:
        logging.error(
            "database error (probably missing subtype data - see details)",
            exc_info=True,
        )
        raise

    return new


def parse_and_migrate_single_activity(
    activity_id: str, clobber=True, dry_run=False
) -> dict[str, bool]:
    status = {
        "pre_existing": False,
        "clobbered": False,
        "parse_ok": False,
        "save_skipped": False,
        "save_ok": False,
        "pending_links_created": False,
        "django_validation_failed": False,
        "unspecified_failure": False,
    }

    with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
        with conn.cursor() as cursor:

            q = """
          select activity_id,
                 activity_type,
                 activity_subtype,
                 activity_payload,
                 form_status,
                 batch_id,
                 row_number,

                 subject,

                 created_timestamp,
                 received_timestamp,
                 deleted_timestamp,

                 created_by,
                 created_by_with_guid,

                 updated_by,
                 updated_by_with_guid

          from invasivesbc.activity_incoming_data
          where iscurrent = true
            and form_status like 'Submitted'
            and activity_id = %s
          """

            result = cursor.execute(query=q, params=(activity_id,))

            row = result.fetchone()

            errors = MigrationErrors(errors=[])
            migration_status = ActivityMigrationStatus.objects.filter(
                activity_id=activity_id
            ).first()
            pre_existing = False
            if migration_status is not None:
                pre_existing = True
                status["pre_existing"] = pre_existing

                if clobber:
                    log.debug(f"Clobbering old records for {activity_id}")
                    migration_status.delete()
                    migration_status = ActivityMigrationStatus(activity_id=activity_id)
                    Activity.objects.filter(id=activity_id).delete()
                    status["clobbered"] = True
            else:
                migration_status = ActivityMigrationStatus(activity_id=activity_id)

            try:
                parsed_activity = LegacyActivity.model_validate(row, extra="forbid")
                log.debug(parsed_activity)
                status["parse_ok"] = True
                if not dry_run and (not pre_existing or clobber):
                    try:
                        with transaction.atomic():
                            new_activity = map_pydantic_model_to_django_model(
                                parsed_activity
                            )
                            status["save_ok"] = True
                            migration_status.success = True

                            if (
                                parsed_activity.activity_payload.form_data.activity_type_data.linked_id
                                is not None
                                and parsed_activity.activity_payload.form_data.activity_type_data.linked_id
                                != ""
                            ):
                                ActivityPendingLink.objects.create(
                                    from_activity_id=new_activity.id,
                                    to_activity_id=parsed_activity.activity_payload.form_data.activity_type_data.linked_id,
                                )
                                status["pending_links_created"] = True

                    except DjangoValidationError as e:
                        log.warning(
                            f"validation for {activity_id} failed",
                            exc_info=True,
                        )
                        errors.errors.append(("validation", e.__str__()))
                        status["django_validation_failed"] = True
                    except DatabaseError as e:
                        log.warning(
                            f"database exception while saving new activity {activity_id}",
                            exc_info=True,
                        )
                        errors.errors.append(("database error", e.__str__()))
                        status["save_ok"] = False
                    except Exception as e:
                        log.warning(
                            f"{activity_id} failed to migrate",
                            exc_info=True,
                        )
                        errors.errors.append(("general failure", e.__str__()))
                        status["unspecified_failure"] = True

            except ValidationError as e:
                log.warning(
                    f"initial parse for {row['activity_id']} failed",
                    exc_info=True,
                )
                errors.errors.append(
                    ("parse failed", e.__str__()),
                )
                status["parse_ok"] = False
            finally:
                conn.close()
                if dry_run or (pre_existing and not clobber):
                    status["save_skipped"] = True
                else:
                    status["save_skipped"] = False
                    migration_status.save()
                    if len(errors.errors) > 0:
                        for error in errors.errors:
                            logging.warning("error")
                            MigrationError.objects.create(
                                migration_status=migration_status,
                                reason=error[0],
                                extended_status=error[1],
                            )

        return status
