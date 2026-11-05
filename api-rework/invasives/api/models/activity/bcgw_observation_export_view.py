from django.db import models
from django.core.exceptions import PermissionDenied
from api.models import ReadOnlyManager


class BCGWObservationExportView(models.Model):
    """
    Unmanaged Model for the BCGW Observation View
    """

    objects = ReadOnlyManager()

    short_id = models.CharField(primary_key=True)
    activity_type = models.CharField()
    activity_subtype = models.CharField()
    activity_date = models.CharField()
    latitude = models.CharField()
    longitude = models.CharField()
    symbol = models.CharField()
    geometry = models.CharField()
    invasive_plant = models.CharField()
    species_positive = models.CharField()
    species_positive_full = models.CharField()
    species_negative = models.CharField()
    species_negative_full = models.CharField()
    area = models.IntegerField()

    class Meta:
        db_table = '"bcgw"."invasivesbc_observations"'
        managed = False

    def save(self, *args, **kwargs):
        raise PermissionDenied("This model is read-only.")

    def delete(self, *args, **kwargs):
        raise PermissionDenied("This model is read-only.")
