from django.db import models
from api.models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from api.models.codes import TerrestrialPlantCode, AquaticPlantCode

class VoucherSpecimen(BaseOneToOneActivityTable):
  invasive_plant = models.ForeignKey("PlantCodes", on_delete=models.PROTECT)
  voucher_sample_id = models.PositiveBigIntegerField()
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
    abstract=True
    constraints = [
      models.UniqueConstraint(fields=["activity_id", "invasive_plant"], name="voucher_specimen_unique_plant")
    ]


class TerrestrialVoucherSpecimen(VoucherSpecimen):
  invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)
  class Meta:
    # db_table='"activity"."terrestrial_voucher_specimen"'
    pass

class AquaticVoucherSpecimen(VoucherSpecimen):
  invasive_plant = models.ForeignKey(AquaticPlantCode, on_delete=models.PROTECT)
  class Meta:
    # db_table='"activity"."aquatic_voucher_specimen"'
    pass
