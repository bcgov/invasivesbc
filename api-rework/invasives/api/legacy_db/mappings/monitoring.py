from api.legacy_db.mappings.participants import add_persons
from api.legacy_db.mappings.wells import add_well_information
from api.legacy_db.model_serializer import (
    LegacyActivity,
    LegacyMechanicalTerrestrialAquaticMonitoringInformation,
    LegacyActivityChemicalMonitoring,
)
from api.models.activity import (
    Activity,
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
    ActivityDataRecord,
)
from api.models.activity.monitoring import InvasivePlantsOnSite
from api.models.codes import (
    TerrestrialPlantCode,
    AquaticPlantCode,
    EfficacyManagementRatingCode,
    TreatmentEfficacyRatingCode,
    InvasivePlantsOnSiteCode,
)
from api.models.enums import YesNo


def add_monitoring_entry(
    new: Activity,
    adr: ActivityDataRecord,
    mt: (
        LegacyMechanicalTerrestrialAquaticMonitoringInformation
        | LegacyActivityChemicalMonitoring
    ),
):
    terrestrial_plant_code = TerrestrialPlantCode.objects.filter(
        code=mt.invasive_plant_code
    ).first()
    aquatic_plant_code = AquaticPlantCode.objects.filter(
        code=mt.invasive_plant_aquatic_code
    ).first()

    if terrestrial_plant_code is None and aquatic_plant_code is None:
        raise ValueError(
            f"Neither Terrestrial nor Aquatic Plant code can be found {mt.invasive_plant_code}"
        )

    terrestrial = True if terrestrial_plant_code is not None else False

    if terrestrial_plant_code is not None and aquatic_plant_code is not None:
        # we have both codes. we're going to check the names.
        if terrestrial_plant_code.full == aquatic_plant_code.full:
            # they seem to be the same thing. we'll assume terrestrial and make a note.
            if new.migration_remarks is None:
                new.migration_remarks = ""
            new.migration_remarks += f"Invasives Plant Code {terrestrial_plant_code.code} could refer to either a Terrestrial or Aquatic Plant (codes exist in both tables). This record is assumed to be referring to a terrestrial invasive plant, but this should be manually confirmed."
        else:
            raise ValueError(
                f"Both Terrestrial and Aquatic Plant codes found {mt.invasive_plant_code}, unsure which to use. They do not appear to refer to the same plant (full names differ)"
            )

    code = terrestrial_plant_code if terrestrial else aquatic_plant_code

    monitoring_entry_class = (
        TerrestrialTreatmentMonitoringEntry
        if terrestrial
        else AquaticTreatmentMonitoringEntry
    )

    m = monitoring_entry_class.objects.create(
        activity_data_record=adr,
        invasive_plant=code,
        evidence_of_treatment=(
            YesNo.Yes
            if mt.evidence_of_treatment.lower() == "yes"
            else (YesNo.No if mt.evidence_of_treatment.lower() == "no" else None)
        ),
        treatment_efficacy_rating=(
            TreatmentEfficacyRatingCode.objects.get(code=mt.efficacy_code)
            if (mt.efficacy_code is not None and mt.efficacy_code != "")
            else None
        ),
        management_efficacy_rating=(
            EfficacyManagementRatingCode.objects.get(code=mt.management_efficacy_rating)
            if mt.management_efficacy_rating is not None
            else None
        ),
        treatment_pass=mt.treatment_pass,
        comment=mt.comment,
    )

    for pos in mt.invasive_plants_on_site.split(","):
        InvasivePlantsOnSite.objects.create(
            activity_data_record=adr,
            invasive_plants_on_site=InvasivePlantsOnSiteCode.objects.get(code=pos),
        )


def add_subtype_payload_for_plant_mechanical_monitoring(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)

    for (
        mt
    ) in (
        old.activity_payload.form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information
    ):

        adr = ActivityDataRecord.objects.create(activity=new)
        add_monitoring_entry(new, adr, mt)


def add_subtype_payload_for_plant_chemical_monitoring(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)

    for (
        mt
    ) in (
        old.activity_payload.form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information
    ):
        adr = ActivityDataRecord.objects.create(activity=new)
        add_monitoring_entry(new, adr, mt)
