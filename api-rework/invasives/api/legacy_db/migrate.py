import json
import logging
from decimal import Decimal, ROUND_DOWN
from pprint import pformat

import geojson
import shapely
from django.db import DatabaseError
from pydantic_core._pydantic_core import ValidationError

from api.legacy_db.mappings.biocontrol import (
    add_subtype_payload_for_biocontrol_release,
    add_subtype_payload_for_biocontrol_collection,
    add_subtype_payload_for_biocontrol_dispersal_monitoring_terrestrial_plant,
    add_subtype_payload_for_biocontrol_release_monitoring_terrestrial_plant,
)
from api.legacy_db.mappings.plants import (
    add_subtype_payload_for_plant_terrestrial_observation,
    add_subtype_payload_for_plant_aquatic_observation,
)
from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    ActivitySubtypes,
    FundingAgency,
    ProjectCode,
)
from api.models.codes import (
    EmployerCode,
    FundingAgencyCode,
    JurisdictionCode,
)
from api.models.enums import PlatformSource


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
        case _:
            pass


def migrate(old: LegacyActivity):
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
    new.form_status = old.activity_payload.form_status
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
    new.batch_id = old.activity_payload.batch_id

    new.area_m = old.activity_payload.form_data.activity_data.reported_area
    new.latitude = round(
        Decimal(old.activity_payload.form_data.activity_data.latitude), 7
    )
    new.longitude = round(
        Decimal(old.activity_payload.form_data.activity_data.longitude), 7
    )
    new.utm_zone = old.activity_payload.form_data.activity_data.utm_zone
    new.utm_easting = old.activity_payload.form_data.activity_data.utm_easting
    new.utm_northing = old.activity_payload.form_data.activity_data.utm_northing

    try:
        new.full_clean()
        new.save()
    except ValidationError as e:
        # handled in the caller
        raise

    if old.activity_payload.form_data.activity_data.jurisdictions:
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
            new.jurisdiction_set.update_or_create(
                jurisdiction=jur_code, percent_covered=jurisdiction.percent_covered
            )

    if old.activity_payload.form_data.activity_data.project_code:
        for project_code in old.activity_payload.form_data.activity_data.project_code:
            if project_code.description is not None:
                ProjectCode.objects.update_or_create(
                    description=project_code.description, activity=new
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
        new.employer_set.update_or_create(employer=found_code)

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
        for ag in codes:
            found_code = FundingAgencyCode.objects.filter(code=ag).first()
            if not found_code:
                logging.warning(f"No matching funding agency code found for {ag}")
                raise ValueError(f"No matching funding agency code found for {ag}")

            FundingAgency.objects.update_or_create(activity=new, agency=found_code)

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
