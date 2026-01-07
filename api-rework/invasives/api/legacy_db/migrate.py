from api.legacy_db.model_serializer import LegacyActivity
from api.models import (
    ActivityBasic,
    ActivitySubtypeCode,
    Jurisdiction,
    JurisdictionCode,
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

    # If ActivityBasic is not saved first, we cannot link other records to it.
    new.save()

    src_map = {
        "web": PlatformSource.Web,
        "ios": PlatformSource.Ios,
        "android": PlatformSource.Android,
    }
    Platform.objects.update_or_create(
        activity_id=new,
        src=src_map.get(old.activity_payload.platform_src, PlatformSource.Unknown)
    )
    if old.activity_payload.form_data.activity_data.jurisdictions:
        for jurisdiction in old.activity_payload.form_data.activity_data.jurisdictions:
            jur_code = JurisdictionCode.objects.get(code=jurisdiction.jurisdiction_code)
            if jur_code:
                Jurisdiction.objects.create(jurisdiction=jur_code, percent_covered=jurisdiction.percent_covered, activity_id=new)

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
