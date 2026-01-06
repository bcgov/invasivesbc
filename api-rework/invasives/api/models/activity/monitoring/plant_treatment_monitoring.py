from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models.codes import (
    EfficacyManagementRatingCode,
    AquaticPlantCode,
    TerrestrialPlantCode,
    InvasivePlantsOnSiteCode,
)
from api.models.enums import YesNo, TreatmentPass


class PlantMonitoringBase(BaseOneToManyActivityTable):
    """
    1:M Relationship between for an Activity. PlantMonitoringBase covers Chemical and Mechanical Treatment Monitoring
    Plant Monitoring Base covers the 1:M relationship to an Activity where Monitoring was from a
    past Mechanical or Chemical Treatment
    """

    invasive_plant = models.ForeignKey("PlantCodes", on_delete=models.PROTECT)
    evidence_of_treatment = models.CharField(choices=YesNo)
    management_efficacy_rating = models.ForeignKey(
        EfficacyManagementRatingCode, on_delete=models.PROTECT
    )
    invasive_plants_on_site = models.ForeignKey(
        InvasivePlantsOnSiteCode, on_delete=models.PROTECT
    )
    treatment_pass = models.CharField(choices=TreatmentPass)
    comment = models.TextField(max_length=256, blank=True, null=True)

    class Meta:
        abstract = True
        constraints = [
            models.UniqueConstraint(
                fields=["activity_id", "invasive_plant"], name="u_mech_plant_monitoring"
            )
        ]


class TerrestrialTreatmentMonitoringInformation(PlantMonitoringBase):
    """
    Terrestrial Plant Specific Monitoring for Chemical / Mechanical treatments.
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."ter_treatment_monitoring_info"'
        pass


class AquaticTreatmentMonitoringInformation(PlantMonitoringBase):
    """
    Aquatic Plant Specific Monitoring for Chemical / Mechanical treatments.
    """

    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."aq_treatment_monitoring_info"'
        pass
