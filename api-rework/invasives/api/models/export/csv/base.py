from django.db import models
from django.contrib.gis.db import models as geomodels
from api.models.activity import Activity


class BaseCsvExportModel(models.Model):
    id = models.AutoField(primary_key=True)
    activity_id = models.ForeignKey(Activity, on_delete=models.CASCADE)
    short_id = models.CharField()
    project_code_one = models.CharField(null=True, blank=True)
    project_code_two = models.CharField(null=True, blank=True)
    date = models.DateField()
    area_m = models.FloatField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    utm_zone = models.FloatField()
    utm_easting = models.FloatField()
    utm_northing = models.FloatField()
    employers = models.CharField()
    jurisdictions = models.CharField()
    location_description = models.CharField()
    access_description = models.CharField(null=True, blank=True)
    general_comment = models.CharField(null=True, blank=True)
    participants = models.CharField(null=True, blank=True)
    batch_id = models.PositiveIntegerField(null=True, blank=True)
    computed_invasive_plant_management_area = models.CharField(null=True, blank=True)
    computed_ownership = models.CharField(null=True, blank=True)
    computed_regional_districts = models.CharField(null=True, blank=True)
    computed_flrno_districts = models.CharField(null=True, blank=True)
    computed_moti_districts = models.CharField(null=True, blank=True)
    computed_elevation_m = models.IntegerField(null=True, blank=True)
    has_photo = models.CharField(null=True, blank=True)
    created_timestamp = models.DateTimeField()
    shape = geomodels.GeometryField(srid=4326, geography=False)

    class Meta:
        abstract = True
        ordering = ["date"]
