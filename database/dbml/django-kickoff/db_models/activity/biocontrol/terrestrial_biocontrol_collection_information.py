from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from invasivesbc.db_models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from invasivesbc.db_models.codes import BiocontrolAgentCode, TerrestrialPlantCode, BioAgentCollectionMethodCode
from invasivesbc.db_models.enums import CollectionType

class TerrestrialBiocontrolCollectionInformation(BaseOneToManyActivityTable):
  invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)
  biological_agent = models.ForeignKey(BiocontrolAgentCode, on_delete=models.PROTECT)
  historical_iapp_site = models.PositiveBigIntegerField(blank=True, null=True)
  collection_type = models.CharField(choices=CollectionType)
  plant_count_collection = models.PositiveIntegerField(blank=True, null=True)
  time_collection_duration_minutes = models.PositiveIntegerField(blank=True, null=True)
  collection_method = models.ForeignKey(BioAgentCollectionMethodCode, on_delete=models.PROTECT)
  number_of_sweeps = models.PositiveIntegerField(blank=True, null=True)
  start_time_collecting = models.DateTimeField()
  end_time_collecting = models.DateTimeField()
  comment = models.TextField(max_length=512, blank=True, null=True)

  class Meta:
    # db_table='"activity"."terrestrial_biocontrol_collection_information"'
    pass

  def clean(self):
    errors = {}
    if self.collection_method == CollectionType.Count:
      if self.plant_count_collection is None:
        errors["plant_count_collection"] = "Plant count must be filled if collection type is Count"
      self.time_collection_duration_minutes = None #Ensure other field is blank
    elif self.collection_method == CollectionType.Timed:
      if self.time_collection_duration_minutes is None:
        errors["time_collection_duration_minutes"] = "Count duration must be filled if collection type is Timed"
      self.plant_count_collection = None # Ensure other field is blank

    if self.start_time_collecting > timezone.now():
      errors["start_time_collecting"] = "Start time for collection cannot occur in the future"
    if self.start_time_collecting > self.end_time_collecting:
      errors["end_time_collecting"] = "Cannot stop collecting before collecting began."

    ## TODO: ADD ACTUAL CODE FOR SWEEP
    if self.collection_method == "Sweep Counted" and not self.number_of_sweeps:
      errors["collection_method"] = "Number of sweeps required if collection type is sweep counted"

    if errors:
      raise ValidationError(errors)
