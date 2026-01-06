from api.legacy_db.model_serializer import LegacyActivity
from api.models import (
    ActivityBasic,
    ActivitySubtypeCode,
    Platform,
    PlatformSource,
    ShorelineTypes,
)


def migrate(old: LegacyActivity):
    new = ActivityBasic()
    new.activity_id = old.activity_id
    new.short_id = old.activity_payload.short_id
    new.activity_type = old.activity_type
    new.activity_subtype = ActivitySubtypeCode.objects.get_or_create(
        code=old.activity_subtype.value,
        defaults={
            "code": old.activity_subtype.value,
            "full": old.activity_subtype.value,
        },
    )[0]
    new.access_description = (
        old.activity_payload.form_data.activity_data.access_description
    )
    new.activity_date = old.activity_payload.form_data.activity_data.activity_date_time
    new.form_status = old.activity_payload.form_status
    new.comment = old.activity_payload.form_data.activity_data.general_comment

    new.created_by = old.activity_payload.created_by

    # if old.activity_payload.platform_src:
    #     if old.activity_payload.platform_src == "web":
    #         Platform.objects.create(activity=new, platform_src=PlatformSource.Web)
    #     if old.activity_payload.platform_src == "ios":
    #         Platform.objects.create(activity=new, platform_src=PlatformSource.Ios)
    #     if old.activity_payload.platform_src == "android":
    #         Platform.objects.create(activity=new, platform_src=PlatformSource.Android)
    #     if old.activity_payload.platform_src == "unknown":
    #         Platform.objects.create(activity=new, platform_src=PlatformSource.Unknown)

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
