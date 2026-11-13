from django.db import models

from api.models.iapp.base import (
    IAPPBioDamageFlags,
    IAPPSiteAttributes,
    calendar_date,
    char,
    decimal,
    integer,
    wall_time,
)
from api.models.iapp.site import IAPPSite


class IAPPBiologicalTreatment(IAPPSiteAttributes):
    biotreatmentid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="biological_treatments",
    )
    site_created_date = calendar_date()
    estimated_area_hectares = decimal(10, 4)
    distribution = char(120, null=True)
    density = char(120, null=True)
    treatment_date = calendar_date(null=True)
    treatment_paper_file_id = char(22, null=True)
    treatment_agency = char(120)
    treatment_comments = char(2000, null=True)
    release_quantity = integer()
    bioagent_source = char(120, null=True)
    biological_agent = char(120)
    employer = char(120, null=True)
    collection_date = calendar_date(null=True)
    agent_life_stage = char(10, null=True)
    release_time = wall_time(null=True)
    primary_applicator = char(120)
    other_applicators = char(1000, null=True)
    release_utm_zone = integer(null=True)
    release_utm_easting = integer(null=True)
    release_utm_northing = integer(null=True)

    class Meta:
        db_table = '"iapp"."biological_treatment"'


class IAPPBiologicalMonitoring(IAPPBioDamageFlags, IAPPSiteAttributes):
    biologicalmonitoringid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="biological_monitorings",
    )
    site_created_date = calendar_date()
    biological_agent = char(20)
    treatment_date = calendar_date(null=True)
    treatment_paper_file_id = char(22, null=True)
    treatment_comments = char(2000, null=True)
    monitoring_paper_file_id = char(22, null=True)
    monitoring_agency = char(120)
    inspection_date = calendar_date(null=True)
    primary_surveyor = char(120, null=True)
    other_surveyors = char(1000, null=True)
    agent_count = integer(null=True)
    plant_count = integer(null=True)
    count_duration = integer(null=True)
    legacy_presence = models.BooleanField()
    estimated_area_hectares = decimal(10, 4, null=True)
    distribution = char(120, null=True)
    density = char(120, null=True)
    monitoring_comments = char(2000, null=True)

    class Meta:
        db_table = '"iapp"."biological_monitoring"'


class IAPPBiologicalDispersal(IAPPBioDamageFlags, IAPPSiteAttributes):
    biologicaldispersalid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="biological_dispersals",
    )
    site_created_date = calendar_date()
    biological_agent = char(20)
    dispersal_paper_file_id = char(120, null=True)
    dispersal_agency = char(1000, null=True)
    inspection_date = calendar_date(null=True)
    agent_count = integer(null=True)
    plant_count = integer(null=True)
    count_duration = integer(null=True)
    primary_surveyor = char(120, null=True)
    other_surveyors = char(1000, null=True)
    dispersal_utm_zone = integer(null=True)
    dispersal_utm_easting = integer(null=True)
    dispersal_utm_northing = integer(null=True)
    estimated_area_hectares = decimal(10, 4, null=True)
    distribution = char(120, null=True)
    density = char(120, null=True)
    monitoring_comments = char(2000, null=True)

    class Meta:
        db_table = '"iapp"."biological_dispersal"'
