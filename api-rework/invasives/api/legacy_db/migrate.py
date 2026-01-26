import decimal
import logging

from pydantic_core._pydantic_core import ValidationError

from api.legacy_db.mappings.plants import (
    add_subtype_payload_for_plant_terrestrial_observation,
)
from api.legacy_db.migration_errors import MigrationErrors
from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    ActivitySubtypes,
    ProjectCode,
)
from api.models.codes import (
    EmployerCode,
    InvasivePlantsOnSiteCode,
    JurisdictionCode,
)
from api.models.enums import PlatformSource


def add_subtype_payload(new: Activity, old: LegacyActivity) -> None:
    # temporarily stripped out

    match old.activity_payload.activity_subtype:
        case ActivitySubtypes.Observation_Plant_Terrestrial:
            add_subtype_payload_for_plant_terrestrial_observation(new, old)
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
        decimal.Decimal(old.activity_payload.form_data.activity_data.latitude), 7
    )
    new.longitude = round(
        decimal.Decimal(old.activity_payload.form_data.activity_data.longitude), 7
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

    # @todo agency codes
    # if old.activity_payload.form_data.activity_data.agency_code:
    #     for ag in old.activity_payload.form_data.activity_data.invasive_species_agency_code:
    #         AgencyC.objects.update_or_create(
    #             description=project_code.description, activity=new
    #         )

    add_subtype_payload(new, old)

    try:
        new.full_clean()
        new.save()
    except ValidationError as e:
        logging.error("validation error after subtype data mapped", exc_info=True)
        raise

    return new
