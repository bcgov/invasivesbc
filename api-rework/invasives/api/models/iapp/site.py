from django.contrib.gis.db import models as geomodels
from django.db import models

from api.models.iapp.base import (
    IAPPSiteAttributes,
    calendar_date,
    char,
    decimal,
    integer,
)


class IAPPSite(models.Model):
    site_id = models.IntegerField(primary_key=True)
    protected = models.BooleanField()
    geometry = geomodels.GeometryField(
        srid=4326, geography=False, spatial_index=True, null=True, blank=True
    )

    class Meta:
        db_table = '"iapp"."site"'


class IAPPSiteSelection(IAPPSiteAttributes):
    siteselectionid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="site_selections",
    )
    site_created_date = calendar_date()
    survey_paper_file_id = char(22, null=True)
    last_surveyed_date = calendar_date()
    primary_surveyor = char(120, null=True)
    other_surveyors = char(1000, null=True)
    estimated_area_hectares = decimal(10, 4, null=True)
    distribution = char(120, null=True)
    density = char(120, null=True)
    slope_percent = integer(null=True)
    aspect = integer(null=True)
    elevation = integer(null=True)
    treatment_date = calendar_date(null=True)
    treatment_type = char(120, null=True)
    all_species_on_site = char(2000)

    class Meta:
        db_table = '"iapp"."site_selection"'


class IAPPSurvey(IAPPSiteAttributes):
    surveyid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="surveys",
    )
    survey_paper_file_id = char(22, null=True)
    survey_date = calendar_date()
    survey_type = char(20, null=True)
    estimated_area_hectares = decimal(10, 4, null=True)
    distribution = char(120, null=True)
    density = char(120, null=True)
    survey_agency = char(120)
    employer = char(120, null=True)
    primary_surveyor = char(120, null=True)
    other_surveyors = char(1000, null=True)
    survey_comments = char(2000, null=True)

    class Meta:
        db_table = '"iapp"."survey"'
