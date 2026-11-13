from django.db import models

from api.models.iapp.base import (
    IAPPSiteAttributes,
    calendar_date,
    char,
    decimal,
)
from api.models.iapp.site import IAPPSite


class IAPPMechanicalTreatment(IAPPSiteAttributes):
    mechanicaltreatmentid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="mechanical_treatments",
    )
    site_created_date = calendar_date()
    treatment_date = calendar_date(null=True)
    treatment_paper_file_id = char(22, null=True)
    treatment_agency = char(120)
    treatment_comments = char(2000, null=True)
    treatment_method = char(120)
    estimated_area_hectares = decimal(10, 4)
    employer = char(120, null=True)
    primary_applicator = char(120)
    other_applicators = char(1000, null=True)

    class Meta:
        db_table = '"iapp"."mechanical_treatment"'


class IAPPMechanicalMonitoring(IAPPSiteAttributes):
    mechmonitoringid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="mechanical_monitorings",
    )
    site_created_date = calendar_date()
    treatment_method = char(120)
    treatment_date = calendar_date(null=True)
    treatment_paper_file_id = char(22, null=True)
    treatment_comments = char(2000, null=True)
    monitoring_paper_file_id = char(22, null=True)
    monitoring_agency = char(120)
    inspection_date = calendar_date()
    primary_surveyor = char(120, null=True)
    other_surveyors = char(1000, null=True)
    efficacy_rating = char(120)
    estimated_area_hectares = decimal(10, 4, null=True)
    distribution = char(120, null=True)
    density = char(120, null=True)
    monitoring_comments = char(2000, null=True)

    class Meta:
        db_table = '"iapp"."mechanical_monitoring"'
