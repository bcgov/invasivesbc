from django.db import models
from api.models.activity import RepeatedFormData
from api.models.codes import (
    PlantCode,
    HerbicideCode,
    HerbicideTypeCode,
    JurisdictionCode,
)


class ChemicalApplicationCalculationEntry(RepeatedFormData):
    jurisdiction = models.ForeignKey(JurisdictionCode, on_delete=models.PROTECT)
    jurisdiction_percent = models.FloatField()

    invasive_plant = models.ForeignKey(PlantCode, on_delete=models.PROTECT)
    invasive_plant_percent = models.FloatField()

    amount_of_mix_used = models.FloatField(null=True, blank=True)
    area_treated_sqm = models.FloatField()
    dilution = models.FloatField(null=True, blank=True)
    herbicide_name = models.ForeignKey(HerbicideCode, on_delete=models.PROTECT)
    herbicide_type = models.ForeignKey(HerbicideTypeCode, on_delete=models.PROTECT)
    undiluted_herbicide_used_l = models.FloatField(null=True, blank=True)
    percentage_area_covered = models.FloatField()
    product_application_rate = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = '"activity"."chemical_calculation"'
        db_table_comment = "Single result of a chemical calculation."
