from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToOneActivityTable
from invasivesbc.db_models.codes import ChemicalPrecautionaryStatement, ServiceLicenseNumberAndCompany, PestManagementPlan
from invasivesbc.db_models.enums import CardinalDirection, YesNoUnknown

class ChemTreatment(BaseOneToOneActivityTable):
  service_license_number = models.ForeignKey(ServiceLicenseNumberAndCompany, on_delete=models.PROTECT)
  pesticide_use_permit = models.CharField(max_length=128)
  pest_management_plan = models.ForeignKey(PestManagementPlan, on_delete=models.PROTECT, blank=True, null=True)
  pest_management_plan_manual = models.CharField(max_length=128, blank=True, null=True)
  # Ideal temperature should be between 10-28 degrees. But allow greater to catch non-compliance.
  # Prevent >= 100 to catch mistakes e.g. 10 -> 100 (from extra 0 press), etc.
  temperature_c = models.PositiveSmallIntegerField(validators=[MaxValueValidator(99)])
  wind_speed_kmh = models.PositiveSmallIntegerField(validators=[MaxValueValidator(99)])
  application_start_time = models.DateTimeField()
  wind_direction = models.CharField(choices=CardinalDirection, default=CardinalDirection.NonApplicable)
  humidity = models.SmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
  treatment_notice_signs = models.CharField(choices=YesNoUnknown)
  precautionary_statement = models.ForeignKey(ChemicalPrecautionaryStatement, on_delete=models.PROTECT)
  ntz_reduction_bool = models.BooleanField()
  rationale_for_ntz_reduction = models.CharField(max_length=256, blank=True, null=True)
  additional_unmapped_well_water_bool = models.BooleanField(db_column="Additional or unmapped wells or water license intakes within 30m")
  pest_injury_threshold_determination_bool = models.BooleanField()

  def clean(self):
    super().clean()
    errors = {}
    if self.application_start_time and self.application_start_time > timezone.now():
      errors["application_start_time"] = "Application start time cannot occur in the future."
    if self.ntz_reduction_bool and not self.rationale_for_ntz_reduction:
      errors["rationale_for_ntz_reduction"] = "Rationale for NTZ reduction cannot be blank if NTZ Reduction is true"
    elif not self.ntz_reduction_bool and self.rationale_for_ntz_reduction:
      self.rationale_for_ntz_reduction = None

    if self.pest_management_plan and self.pest_management_plan_manual:
      errors["pest_management_plan"] = "You must only fill either Pest Management Plan or Unlisted Drop Down field."
      errors["pest_management_plan_manual"] = "You must only fill either Pest Management Plan or Unlisted Drop Down field."
    if self.wind_speed_kmh > 0 and self.wind_direction == CardinalDirection.NonApplicable:
      errors["wind_direction"] = "Must specify a wind direction when wind speed is > 0"
    if errors:
      raise ValidationError(errors)
