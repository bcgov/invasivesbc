from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes import (
    TerrestrialPlantCode,
    AquaticPlantCode,
)


## Submitted
class BaseModel(models.Model):
    invasive_plant = models.ForeignKey("PlantCode", on_delete=models.PROTECT)
    percent_covered = models.PositiveIntegerField()

    class Meta:
        abstract = True
        db_table_comment = "Invasive plant belonging to a chemical treatment record"


class ChemPlantEntryTerrestrial(BaseModel, RepeatedFormData):
    invasive_plant = models.ForeignKey(
        TerrestrialPlantCode,
        on_delete=models.PROTECT,
    )

    class Meta:
        db_table = '"activity"."chem_plant_entry_terrestrial"'


class ChemPlantEntryAquatic(BaseModel, RepeatedFormData):
    invasive_plant = models.ForeignKey(
        AquaticPlantCode,
        on_delete=models.PROTECT,
    )

    class Meta:
        db_table = '"activity"."chem_plant_entry_aquatic"'


## Draft
class DraftBaseModel(BaseModel):
    invasive_plant = models.ForeignKey(
        "PlantCode",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    percent_covered = models.PositiveIntegerField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        abstract = True


class DraftChemPlantEntryTerrestrial(DraftBaseModel, DraftRepeatedFormData):
    invasive_plant = models.ForeignKey(
        TerrestrialPlantCode,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )

    class Meta:
        db_table = '"draft_activity"."chem_plant_entry_terrestrial"'


class DraftChemPlantEntryAquatic(DraftBaseModel, DraftRepeatedFormData):
    invasive_plant = models.ForeignKey(
        AquaticPlantCode,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )

    class Meta:
        db_table = '"draft_activity"."chem_plant_entry_aquatic"'
