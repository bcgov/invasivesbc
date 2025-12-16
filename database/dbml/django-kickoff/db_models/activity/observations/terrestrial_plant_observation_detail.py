from django.db import models
from django.core.exceptions import ValidationError
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from invasivesbc.db_models.codes import DensityCode, DistributionCode, TerrestrialPlantCode, PlantLifeStageCode
from invasivesbc.db_models.enums import ObservationType

class TerrestrialPlantObservationDetail(BaseOneToManyActivityTable):
  """
    section title:
      Terrestrial Invasive Plants
    consumed by:
      - Terrestrial Invasive Plant Observation
  """
  invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)
  density = models.ForeignKey(DensityCode, on_delete=models.PROTECT, blank=True, null=True)
  distribution = models.ForeignKey(DistributionCode, on_delete=models.PROTECT, blank=True, null=True)
  life_stage = models.ForeignKey(PlantLifeStageCode, on_delete=models.PROTECT, blank=True, null=True)
  observation_type = models.CharField(choices=ObservationType, db_comment="The invasive plant in this record was [not] seen at the site.")

  class Meta:
    # db_table='"activity"."terrestrial_plant_observation_detail"'
    constraints = [
      models.UniqueConstraint(
        fields=["activity_id", "invasive_plant"],
        name="terrestrialplant_observation_detail_unique_plant"
      )
    ]

  def clean(self):
    super().clean()
    requirements = {
      ObservationType.Positive: {
        "density": True,
        "distribution": True,
        "life_stage": True
      },
      ObservationType.Negative: {
        "density": False,
        "distribution": False,
        "life_stage": False
      }
    }
    required_config = requirements.get(self.observation_type, {})
    errors = {}

    for field, should_exist in required_config.items():
      value = getattr(self,field)
      if should_exist and not value:
        errors[field] = f"{field.replace('_', ' ').title()} cannot be null when observation is positive"
      elif not should_exist and value is not None:
        errors[field] = f"A negative observation cannot have a {field.replace('_', ' ')}"

    if errors:
      raise ValidationError(errors)
