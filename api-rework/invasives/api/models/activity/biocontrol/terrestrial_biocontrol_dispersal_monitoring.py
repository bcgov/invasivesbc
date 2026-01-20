from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from api.models.activity import BaseOneToManyActivityTable, ActivitySubtypes
from api.models.codes.code_tables import (
    BiocontrolAgentCode,
    TerrestrialPlantCode,
    BioAgentCollectionMethodCode,
)
from api.models.enums import CollectionType, YesNoUnknown


class TerrestrialBiocontrolDispersalMonitoring(BaseOneToManyActivityTable):
    """
    Biocontrol 1:M Monitoring Information
    Used in:
      - Biocontrol Release Monitoring
      - Biocontrol Dispersal Monitoring
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)
    biocontrol_agent = models.ForeignKey(BiocontrolAgentCode, on_delete=models.PROTECT)
    biocontrol_present = models.BooleanField()
    monitoring_type = models.CharField(choices=CollectionType)
    plant_count = models.PositiveIntegerField()
    monitoring_method = models.ForeignKey(
        BioAgentCollectionMethodCode, on_delete=models.PROTECT
    )
    count_duration_minutes = models.SmallIntegerField(blank=True, null=True)
    number_of_sweeps = models.PositiveSmallIntegerField(blank=True, null=True)
    start_time = models.DateTimeField()
    stop_time = models.DateTimeField()
    linear_segment = models.CharField(choices=YesNoUnknown, blank=True, null=True)
    suitable_for_collection = models.CharField(choices=YesNoUnknown)

    class Meta:
        db_table = '"activity"."terrestrial_biocontrol_dispersal_monitoring"'
        constraints = [
            models.UniqueConstraint(
                fields=["activity", "invasive_plant", "biocontrol_agent"],
                name="unique_dispersal_monitoring",
            )
        ]

    def clean(self):
        super().clean()
        errors = {}
        if self.biocontrol_present and not self.sign_of_biocontrol_presence:
            errors["sign_of_biocontrol_presence"] = (
                "Sign of Biocontrol Presence must be filled since you \
        indicated biocontrol were present."
            )
        elif not self.biocontrol_present:
            self.sign_of_biocontrol_presence = None

        if self.collection_method == CollectionType.Count:
            if self.plant_count_collection is None:
                errors["plant_count_collection"] = (
                    "Plant count must be filled if collection type is Count"
                )
            self.time_collection_duration_minutes = None  # Ensure other field is blank
        elif self.collection_method == CollectionType.Timed:
            if self.time_collection_duration_minutes is None:
                errors["time_collection_duration_minutes"] = (
                    "Count duration must be filled if collection type is Timed"
                )
            self.plant_count_collection = None  # Ensure other field is blank

        if self.start_time_collecting > timezone.now():
            errors["start_time_collecting"] = (
                "Start time for collection cannot occur in the future"
            )
        if self.start_time_collecting > self.end_time_collecting:
            errors["end_time_collecting"] = (
                "Cannot stop collecting before collecting began."
            )
        if self.activity.subtype != ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial \
            and self.linear_segment is None:
            errors["linear_segment"] = (
                "Linear segment is a required field"
            )
        ## TODO: ADD ACTUAL CODE FOR SWEEP
        if self.collection_method == "Sweep Counted" and not self.number_of_sweeps:
            errors["collection_method"] = (
                "Number of sweeps required if collection type is sweep counted"
            )
        elif self.collection_method != "Sweep Counted":
            self.number_of_sweeps = None

        if errors:
            raise ValidationError(errors)
