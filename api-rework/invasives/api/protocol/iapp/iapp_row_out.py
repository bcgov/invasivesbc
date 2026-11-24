from datetime import date
import json

from django.db.models import Model
from geojson_pydantic import Point
from ninja import Schema
from typing import List, Optional

from api.models.iapp import (
    IAPPBiologicalTreatment,
    IAPPBiologicalMonitoring,
    IAPPBiologicalDispersal,
    IAPPChemicalTreatment,
    IAPPChemicalMonitoring,
    IAPPMechanicalTreatment,
    IAPPMechanicalMonitoring,
    IAPPSurvey,
    IAPPSiteSelection,
    IAPPSite,
)


def yes_no_exists(site_id: str | int, model: Model) -> str:
    if model.objects.filter(site_id=site_id).exists():
        return "Yes"
    return "No"


def distinct_list(key: str, site_id: str | int, model: Model) -> str | None:
    kwargs = {f"{key}__isnull": False}
    qs = (
        model.objects.filter(site_id=site_id, **kwargs)
        .values_list(key, flat=True)
        .distinct(key)
        .order_by(key)
    )
    return ", ".join(qs)


class IappRowOut(Schema):
    site_id: int
    site_paper_file_id: Optional[str] = None
    jurisdictions_flattened: Optional[str] = None
    min_survey: Optional[date] = None
    max_survey: Optional[date] = None
    all_species_on_site: Optional[str] = None
    biological_agent: Optional[str] = None
    agencies: Optional[str] = None
    has_biological_treatments: Optional[str] = None
    has_chemical_treatments: Optional[str] = None
    has_mechanical_treatments: Optional[str] = None
    has_biological_dispersals: Optional[str] = None
    monitored: Optional[str] = None
    regional_district: Optional[str] = None
    regional_invasive_species_organization: Optional[str]
    invasive_plant_management_area: Optional[str]
    geometry: Optional[Point] = None

    @staticmethod
    def resolve_min_survey(obj: IAPPSite, context):
        qs = IAPPSurvey.objects.filter(site_id=obj.site_id)
        return qs.order_by("survey_date").values_list("survey_date", flat=True).first()

    @staticmethod
    def resolve_site_paper_file_id(obj: IAPPSite, context):
        return distinct_list("site_paper_file_id", obj.site_id, IAPPSiteSelection)

    @staticmethod
    def resolve_max_survey(obj: IAPPSite, context):
        qs = IAPPSurvey.objects.filter(site_id=obj.site_id)
        return qs.order_by("-survey_date").values_list("survey_date", flat=True).first()

    @staticmethod
    def resolve_geometry(obj: IAPPSite):
        return json.loads(obj.geometry.geojson)

    @staticmethod
    def resolve_biological_agent(obj: IAPPSite):
        sensitive = {"protected": False}
        return ", ".join(
            sorted(
                list(
                    {
                        *IAPPBiologicalTreatment.objects.filter(
                            site_id=obj.site_id, **sensitive
                        ).values_list("biological_agent", flat=True),
                        *IAPPBiologicalMonitoring.objects.filter(
                            site_id=obj.site_id, **sensitive
                        ).values_list("biological_agent", flat=True),
                        *IAPPBiologicalDispersal.objects.filter(
                            site_id=obj.site_id, **sensitive
                        ).values_list("biological_agent", flat=True),
                    }
                )
            )
        )

    @staticmethod
    def resolve_jurisdictions_flattened(obj: IAPPSite):
        return distinct_list("jurisdictions", obj.site_id, IAPPSiteSelection)

    @staticmethod
    def resolve_agencies(obj: IAPPSite):
        return distinct_list("survey_agency", obj.site_id, IAPPSurvey)

    @staticmethod
    def resolve_has_biological_treatments(obj: IAPPSite):
        return yes_no_exists(site_id=obj.site_id, model=IAPPBiologicalTreatment)

    @staticmethod
    def resolve_has_chemical_treatments(obj: IAPPSite):
        return yes_no_exists(site_id=obj.site_id, model=IAPPChemicalTreatment)

    @staticmethod
    def resolve_has_mechanical_treatments(obj: IAPPSite):
        return yes_no_exists(site_id=obj.site_id, model=IAPPMechanicalTreatment)

    @staticmethod
    def resolve_has_biological_dispersals(obj: IAPPSite):
        return yes_no_exists(site_id=obj.site_id, model=IAPPBiologicalDispersal)

    @staticmethod
    def resolve_monitored(obj: IAPPSite):
        if (
            IAPPChemicalMonitoring.objects.filter(site_id=obj.site_id).exists()
            or IAPPMechanicalMonitoring.objects.filter(site_id=obj.site_id).exists()
        ):
            return "Yes"
        return "No"

    @staticmethod
    def resolve_regional_district(obj: IAPPSite):
        return distinct_list("regional_district", obj.site_id, IAPPSiteSelection)

    @staticmethod
    def resolve_regional_invasive_species_organization(obj: IAPPSite):
        return distinct_list(
            "regional_invasive_species_organization", obj.site_id, IAPPSiteSelection
        )

    @staticmethod
    def resolve_invasive_plant_management_area(obj: IAPPSite):
        return distinct_list(
            "invasive_plant_management_area", obj.site_id, IAPPSiteSelection
        )

    @staticmethod
    def resolve_all_species_on_site(obj: IAPPSite):
        return distinct_list("all_species_on_site", obj.site_id, IAPPSiteSelection)


class IAPPRowResponse(Schema):
    count: int
    entries: List[IappRowOut]
