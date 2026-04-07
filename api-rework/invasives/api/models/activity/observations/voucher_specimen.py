from django.db import models
from api.models.activity import UnrepeatedFormData
from api.models.codes.code_tables import TerrestrialPlantCode, AquaticPlantCode


class VoucherSpecimen(UnrepeatedFormData):
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


class TerrestrialVoucherSpecimen(VoucherSpecimen):
    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."voucher_specimen_pt"'
        pass


class AquaticVoucherSpecimen(VoucherSpecimen):
    invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."voucher_specimen_pa"'
        pass
