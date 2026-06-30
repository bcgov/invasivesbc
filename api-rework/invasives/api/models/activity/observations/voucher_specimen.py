from django.db import models
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData
from api.models.codes.code_tables import TerrestrialPlantCode, AquaticPlantCode


class BaseModel(models.Model):
    invasive_plant = models.ForeignKey("PlantCodes", on_delete=models.PROTECT)
    voucher_sample_id = models.CharField(max_length=128)
    date_collected = models.DateField()
    date_verified = models.DateField()
    herbarium = models.CharField()
    accession_number = models.CharField()
    completed_by_person = models.CharField()
    completed_by_org = models.CharField()
    utm_zone = models.PositiveSmallIntegerField()
    utm_easting = models.PositiveBigIntegerField()
    utm_northing = models.PositiveBigIntegerField()

    class Meta:
        abstract = True


class TerrestrialVoucherSpecimen(BaseModel, UnrepeatedFormData):
    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."voucher_specimen_pt"'


class AquaticVoucherSpecimen(BaseModel, UnrepeatedFormData):
    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."voucher_specimen_pa"'


class DraftBaseVoucherSpecimen(BaseModel, DraftUnrepeatedFormData):
    invasive_plant = models.ForeignKey(
        "PlantCodes", on_delete=models.PROTECT, blank=True, null=True
    )
    voucher_sample_id = models.CharField(max_length=128, blank=True, null=True)
    date_collected = models.DateField(blank=True, null=True)
    date_verified = models.DateField(blank=True, null=True)
    herbarium = models.CharField(blank=True, null=True)
    accession_number = models.CharField(blank=True, null=True)
    completed_by_person = models.CharField(blank=True, null=True)
    completed_by_org = models.CharField(blank=True, null=True)
    utm_zone = models.PositiveSmallIntegerField(blank=True, null=True)
    utm_easting = models.PositiveBigIntegerField(blank=True, null=True)
    utm_northing = models.PositiveBigIntegerField(blank=True, null=True)

    class Meta:
        abstract = True


class DraftTerrestrialVoucherSpecimen(DraftBaseVoucherSpecimen):
    invasive_plant = models.ForeignKey(
        TerrestrialPlantCode, on_delete=models.PROTECT, null=True, blank=True
    )

    class Meta:
        db_table = '"draft_activity"."voucher_specimen_pt"'


class DraftAquaticVoucherSpecimen(DraftBaseVoucherSpecimen):
    invasive_plant = models.ForeignKey(
        AquaticPlantCode, on_delete=models.PROTECT, null=True, blank=True
    )

    class Meta:
        db_table = '"draft_activity"."voucher_specimen_pa"'
