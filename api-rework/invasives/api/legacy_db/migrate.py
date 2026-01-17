import logging

from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    ActivitySubtypes,
)
from api.models.codes import (
    JurisdictionCode,
)
from api.models.enums import PlatformSource


def migrate(old: LegacyActivity):
    new = Activity()
    new.activity_id = old.activity_id
    new.short_id = old.activity_payload.short_id
    new.activity_type = old.activity_type
    new.activity_subtype = ActivitySubtypes.find_by_legacy_database_name(
        old.activity_payload.activity_subtype.value
    ).name
    new.access_description = (
        old.activity_payload.form_data.activity_data.access_description
    )
    new.activity_date = old.activity_payload.form_data.activity_data.activity_date_time
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

    # pprint(old)

    new.latitude = old.activity_payload.form_data.activity_data.latitude
    new.longitude = old.activity_payload.form_data.activity_data.longitude
    new.utm_zone = old.activity_payload.form_data.activity_data.utm_zone
    new.utm_easting = old.activity_payload.form_data.activity_data.utm_easting
    new.utm_northing = old.activity_payload.form_data.activity_data.utm_northing

    # If Activity is not saved first, we cannot link other records to it.
    new.save()

    if (
        old.activity_payload.form_data.activity_type_data.linked_id is not None
        and old.activity_payload.form_data.activity_type_data.linked_id != ""
    ):
        logging.warning(
            "linked_id: %s", old.activity_payload.form_data.activity_type_data.linked_id
        )
        try:
            new.linked_activities.add(
                Activity.objects.get(
                    activity_id=old.activity_payload.form_data.activity_type_data.linked_id
                )
            )
        except Activity.DoesNotExist:
            # @todo add to errors object
            logging.warning("Linked activity does not exist")

    # re-save
    new.save()

    if old.activity_payload.form_data.activity_data.jurisdictions:
        for jurisdiction in old.activity_payload.form_data.activity_data.jurisdictions:
            jur_code = JurisdictionCode.objects.get(code=jurisdiction.jurisdiction_code)
            if jur_code:
                new.jurisdiction_set.update_or_create(
                    jurisdiction=jur_code, percent_covered=jurisdiction.percent_covered
                )

    st = old.activity_payload.form_data.activity_subtype_data

    if st.WaterQuality:
        pass
    if st.ShorelineTypes:
        pass
    if st.AquaticPlants:
        pass
    if st.WaterbodyData:
        pass
    if st.Authorization_Infotmation:
        pass
    if st.Biocontrol_Collection_Information:
        pass
    if st.Biocontrol_Release_Information:
        pass
    if st.chemical_treatment_details:
        pass
    if st.Microsite_Conditions:
        pass
    if st.Monitoring_BiocontrolDispersal_Information:
        pass
    if st.Monitoring_BiocontrolRelease_TerrestrialPlant_Information:
        pass
    if st.Monitoring_ChemicalTerrestrialAquaticPlant_Information:
        pass
    if st.Monitoring_MechanicalTerrestrialAquaticPlant_Information:
        pass
    if st.Observation_PlantAquatic_Information:
        pass
    if st.Pest_Injury_Threshold_Determination:
        pass
    if st.Target_Plant_Phenology:
        pass
    if st.Weather_Conditions:
        pass
    if st.Well_Information:
        pass
    if st.Treatment_ChemicalPlant_Information:
        pass
    if st.Treatment_ChemicalPlant_Information:
        pass

    return new
