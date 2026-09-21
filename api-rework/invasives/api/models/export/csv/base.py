from django.db import models
from django.contrib.gis.db import models as geomodels
from api.models.activity import Activity
from django.utils import timezone
from django.utils.functional import classproperty


class BaseCsvExportModel(models.Model):
    id = models.BigAutoField(primary_key=True)
    last_exported = models.DateTimeField(default=timezone.now)
    activity_id = models.ForeignKey(Activity, on_delete=models.CASCADE)
    agencies = models.CharField()
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
    participants = models.CharField()
    batch_id = models.PositiveIntegerField(null=True, blank=True)
    computed_biogeoclimatic_zones = models.CharField(null=True, blank=True)
    computed_invasive_plant_management_area = models.CharField(null=True, blank=True)
    computed_ownership = models.CharField(null=True, blank=True)
    computed_regional_districts = models.CharField(null=True, blank=True)
    computed_riso_areas = models.CharField(null=True, blank=True)
    computed_flrno_districts = models.CharField(null=True, blank=True)
    computed_moti_districts = models.CharField(null=True, blank=True)
    computed_elevation_m = models.IntegerField(null=True, blank=True)
    has_photo = models.CharField()
    created_timestamp = models.DateTimeField()
    shape = geomodels.GeometryField(srid=4326, geography=False)

    class Meta:
        abstract = True
        ordering = ["date"]

    LEADING_CSV_COLUMNS = [
        {"key": "short_id", "label": "ID"},
        {"key": "project_code_one", "label": "Project Code - 1"},
        {"key": "project_code_two", "label": "Project Code - 2"},
        {"key": "date", "label": "Date"},
        {"key": "area_m", "label": "Area (m)"},
        {"key": "latitude", "label": "Latitude"},
        {"key": "longitude", "label": "Longitude"},
        {"key": "utm_zone", "label": "UTM Zone"},
        {"key": "utm_easting", "label": "UTM Easting"},
        {"key": "utm_northing", "label": "UTM Northing"},
        {"key": "employers", "label": "Employer(s)"},
        {"key": "agencies", "label": "Funding Agencies"},
        {"key": "jurisdictions", "label": "Jurisdictions"},
        {"key": "location_description", "label": "Location Description"},
        {"key": "access_description", "label": "Access Description"},
        {"key": "general_comment", "label": "Comment"},
        {"key": "participants", "label": "Participants"},
    ]
    SUBTYPE_CSV_COLUMNS = []
    TRAILING_CSV_COLUMNS = [
        {"key": "batch_id", "label": "Batch ID"},
        {"key": "computed_biogeoclimatic_zones", "label": "BEC Zone(s)"},
        {"key": "computed_riso_areas", "label": "RISO Area(s)"},
        {"key": "computed_invasive_plant_management_area", "label": "IPMA Area(s)"},
        {"key": "computed_ownership", "label": "Ownership"},
        {"key": "computed_regional_districts", "label": "Regional District(s)"},
        {"key": "computed_flrno_districts", "label": "FLRNO District(s)"},
        {"key": "computed_moti_districts", "label": "MOTI District(s)"},
        {"key": "computed_elevation_m", "label": "Elevation (m)"},
        {"key": "has_photo", "label": "Has Photo"},
        {"key": "created_timestamp", "label": "Creation Date (UTC)"},
        {"key": "shape", "label": "Geography"},
    ]

    @classproperty
    def subtype_columns(self):
        """Used for CSV Testing"""
        return self.SUBTYPE_CSV_COLUMNS

    @classproperty
    def csv_export_config(self):
        return (
            self.LEADING_CSV_COLUMNS
            + self.SUBTYPE_CSV_COLUMNS
            + self.TRAILING_CSV_COLUMNS
        )
