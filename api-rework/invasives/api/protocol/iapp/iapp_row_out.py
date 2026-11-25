import json
from datetime import date
from geojson_pydantic import Point
from ninja import Schema
from typing import List, Optional

from api.models.iapp import IAPPSite


def prefetch_yes_no_exists(obj: IAPPSite, rel: str) -> str:
    """Iterate through prefetched values to avoid DB round trips"""
    if bool(getattr(obj, rel).all()):
        return "Yes"
    return "No"


def prefetch_distinct_list(
    obj: IAPPSite, rel: str, key, join: bool = True
) -> str | None:
    """Iterate through prefetched values to avoid DB round trips."""
    result = sorted(
        set(
            [
                getattr(v, key)
                for v in getattr(obj, rel).all()
                if getattr(v, key) is not None
            ]
        )
    )
    if join:
        return ", ".join(result)
    return result


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
    def resolve_min_survey(obj: IAPPSite):
        dates = prefetch_distinct_list(
            obj, "site_selections", "site_created_date", join=False
        )
        return min(dates, default=None)

    @staticmethod
    def resolve_site_paper_file_id(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "site_paper_file_id")

    @staticmethod
    def resolve_max_survey(obj: IAPPSite):
        dates = prefetch_distinct_list(
            obj, "site_selections", "last_surveyed_date", join=False
        )
        return max(dates, default=None)

    @staticmethod
    def resolve_geometry(obj: IAPPSite):
        return json.loads(obj.geometry.geojson)

    @staticmethod
    def resolve_biological_agent(obj: IAPPSite):
        AGENT_KEY = "biological_agent"
        bt = prefetch_distinct_list(obj, "biological_treatments", AGENT_KEY, join=False)
        bd = prefetch_distinct_list(obj, "biological_dispersals", AGENT_KEY, join=False)
        bm = prefetch_distinct_list(
            obj, "biological_monitorings", AGENT_KEY, join=False
        )
        return ", ".join(sorted(set(bt + bm + bd)))

    @staticmethod
    def resolve_jurisdictions_flattened(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "jurisdictions")

    @staticmethod
    def resolve_agencies(obj: IAPPSite):
        return prefetch_distinct_list(obj, "surveys", "survey_agency")

    @staticmethod
    def resolve_has_biological_treatments(obj: IAPPSite):
        return prefetch_yes_no_exists(obj, "biological_treatments")

    @staticmethod
    def resolve_has_chemical_treatments(obj: IAPPSite):
        return prefetch_yes_no_exists(obj, "chemical_treatments")

    @staticmethod
    def resolve_has_mechanical_treatments(obj: IAPPSite):
        return prefetch_yes_no_exists(obj, "mechanical_treatments")

    @staticmethod
    def resolve_has_biological_dispersals(obj: IAPPSite):
        return prefetch_yes_no_exists(obj, "biological_dispersals")

    @staticmethod
    def resolve_monitored(obj: IAPPSite):
        if bool(getattr(obj, "mechanical_monitorings").all()) or bool(
            getattr(obj, "chemical_monitorings").all()
        ):
            return "Yes"
        return "No"

    @staticmethod
    def resolve_regional_district(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "regional_district")

    @staticmethod
    def resolve_regional_invasive_species_organization(obj: IAPPSite):
        return prefetch_distinct_list(
            obj, "site_selections", "regional_invasive_species_organization"
        )

    @staticmethod
    def resolve_invasive_plant_management_area(obj: IAPPSite):
        return prefetch_distinct_list(
            obj, "site_selections", "invasive_plant_management_area"
        )

    @staticmethod
    def resolve_all_species_on_site(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "all_species_on_site")


class IAPPRowResponse(Schema):
    count: int
    entries: List[IappRowOut]
