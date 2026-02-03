from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models.codes.code_tables import (
    AquaticPlantCode,
    InvasivePlantsOnSiteCode,
    TerrestrialPlantCode,
)


class BaseInvasivePlantsOnSite(BaseOneToManyActivityTable):
    invasive_plant_on_site = models.ForeignKey(
        InvasivePlantsOnSiteCode, on_delete=models.PROTECT
    )
    invasive_plant = models.ForeignKey("InvasivePlantCode", on_delete=models.CASCADE)

    class Meta:
        abstract = True


class TerrestrialInvasivePlantOnSite(BaseInvasivePlantsOnSite):
    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta(BaseInvasivePlantsOnSite.Meta):
        db_table = '"activity"."plant_on_site_pt"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "invasive_plant", "invasive_plant_on_site"],
                name="t_mech_plants_on_site",
            )
        ]


class AquaticInvasivePlantOnSite(BaseInvasivePlantsOnSite):
    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)

    class Meta(BaseInvasivePlantsOnSite.Meta):
        db_table = '"activity"."plant_on_site_pa"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "invasive_plant", "invasive_plant_on_site"],
                name="a_mech_plants_on_site",
            )
        ]
