from django.db import models

from api.models.iapp.base import (
    IAPPSiteAttributes,
    calendar_date,
    char,
    decimal,
    integer,
    wall_time,
)
from api.models.iapp.site import IAPPSite


class IAPPChemicalTreatment(IAPPSiteAttributes):
    chemicaltreatmentid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="chemical_treatments",
    )
    site_created_date = calendar_date()
    service_licence_number = char(25, null=True)
    pmp_number = char(120)
    pup_number = char(25, null=True)
    treatment_date = calendar_date(null=True)
    treatment_paper_file_id = char(22, null=True)
    treatment_agency = char(120)
    treatment_comments = char(2000, null=True)
    herbicide = char(120)
    method = char(120)
    area_treated_hectares = decimal(10, 4, null=True)
    amount_of_mix_used_litres = decimal(10, 5, null=True)
    application_rate_litres_per_hectare = decimal(6, 2, null=True)
    delivery_rate_litres_per_hectare = integer(null=True)
    dilution_percent = decimal(8, 4, null=True)
    amount_of_undiluted_herbicide_used_litres = decimal(8, 4, null=True)
    tank_mix = char(3, null=True)
    application_time = wall_time(null=True)
    temperature = integer(null=True)
    wind_speed = integer(null=True)
    wind_direction = integer(null=True)
    humidity = integer(null=True)
    employer = char(120, null=True)
    primary_applicator = char(120)
    other_applicators = char(1000)

    class Meta:
        db_table = '"iapp"."chemical_treatment"'


class IAPPChemicalMonitoring(IAPPSiteAttributes):
    chemicalmonitoringid = models.IntegerField(primary_key=True)
    site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="site_id",
        related_name="chemical_monitorings",
    )
    site_created_date = calendar_date()
    service_licence_number = char(25, null=True)
    pmp_number = char(120)
    pup_number = char(25, null=True)
    herbicide = char(120)
    treatment_method = char(120)
    treatment_date = calendar_date(null=True)
    treatment_paper_file_id = char(22, null=True)
    treatment_comments = char(2000, null=True)
    monitoring_paper_file_id = char(120, null=True)
    monitoring_agency = char(120)
    inspection_date = calendar_date()
    primary_surveyor = char(120, null=True)
    other_surveyors = char(1000, null=True)
    efficacy_rating = char(120)
    estimated_area_hectares = decimal(10, 4)
    distribution = char(120, null=True)
    density = char(120, null=True)
    monitoring_comments = char(2000, null=True)

    class Meta:
        db_table = '"iapp"."chemical_monitoring"'
