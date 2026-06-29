from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator
from django.db import models
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData


class TargetPlantPhenologyMixin(models.Model):
    """
    Phenology Reports for Targetted Invasive Species
      Used in:
        - Biocontrol Collection
        - Biocontrol Release Monitoring
        - Biocontrol Dispersal Monitoring
        - Biocontrol Release
    """

    winter_dormant = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], default=0
    )
    seedlings = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], default=0
    )
    rosettes = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], default=0
    )
    bolts = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], default=0
    )
    flowering = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], default=0
    )
    seeds_forming = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], default=0
    )
    senescent = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(100)], default=0
    )

    class Meta:
        abstract = True


class TargetPlantPhenology(TargetPlantPhenologyMixin, UnrepeatedFormData):

    class Meta:
        db_table = '"activity"."target_plant_phenology"'

    def clean(self):
        total = sum(
            self.winter_dormant,
            self.seedlings,
            self.rosettes,
            self.bolts,
            self.flowering,
            self.seeds_forming,
            self.senescent,
        )
        if total != 100:
            raise ValidationError("Sum of all percentages must be equal to 100")


class DraftTargetPlantPhenology(TargetPlantPhenologyMixin, DraftUnrepeatedFormData):
    class Meta:
        db_table = '"draft_activity"."target_plant_phenology"'
