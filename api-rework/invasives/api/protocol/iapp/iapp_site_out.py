from datetime import date
from ninja import Schema
from typing import Optional, List, Any
from api.models.iapp import IAPPSite


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
        return ", ".join(result).strip()
    return result


class IappSiteOut(Schema):
    site_id: int
    date_created: Optional[date] = None
    paper_file_id: Optional[str] = None
    map_sheet: Optional[str] = None
    utm_zone: Optional[int] = None
    utm_easting: Optional[int] = None
    utm_northing: Optional[int] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    elevation: Optional[int] = None
    range_unit_id: Optional[str] = None
    specific_use_code: Optional[str] = None
    aspect_code: Optional[int] = None
    slope_code: Optional[int] = None
    soil_texture_code: Optional[str] = None
    jurisdictions: Optional[str] = None
    access_description: Optional[str] = None
    general_comment: Optional[str] = None
    entered_by: Optional[str] = None
    date_entered: Optional[date] = None
    updated_by: Optional[str] = None
    date_updated: Optional[date] = None
    surveys: List[Any] = []
    mechanical_treatments: List[Any] = []
    chemical_treatments: List[Any] = []
    biological_treatments: List[Any] = []
    biological_dispersals: List[Any] = []

    @staticmethod
    def resolve_date_created(obj: IAPPSite):
        dates = prefetch_distinct_list(
            obj, "site_selections", "site_created_date", join=False
        )
        return min(dates, default=None)

    @staticmethod
    def resolve_paper_file_id(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "site_paper_file_id")

    @staticmethod
    def resolve_map_sheet(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "mapsheet")

    @staticmethod
    def resolve_utm_zone(obj: IAPPSite):
        utm_zone = prefetch_distinct_list(
            obj, "site_selections", "utm_zone", join=False
        )
        return min(utm_zone, default=None)

    @staticmethod
    def resolve_utm_easting(obj: IAPPSite):
        utm_easting = prefetch_distinct_list(
            obj, "site_selections", "utm_easting", join=False
        )
        return min(utm_easting, default=None)

    @staticmethod
    def resolve_utm_northing(obj: IAPPSite):
        utm_northing = prefetch_distinct_list(
            obj, "site_selections", "utm_northing", join=False
        )
        return min(utm_northing, default=None)

    @staticmethod
    def resolve_longitude(obj: IAPPSite):
        longitude = prefetch_distinct_list(
            obj, "site_selections", "decimal_longitude", join=False
        )
        return min(longitude, default=None)

    @staticmethod
    def resolve_latitude(obj: IAPPSite):
        latitude = prefetch_distinct_list(
            obj, "site_selections", "decimal_latitude", join=False
        )
        return min(latitude, default=None)

    @staticmethod
    def resolve_elevation(obj: IAPPSite):
        elevation = prefetch_distinct_list(
            obj, "site_selections", "elevation", join=False
        )
        return min(elevation, default=None)

    @staticmethod
    def resolve_range_unit_id(obj: IAPPSite):
        return None

    @staticmethod
    def resolve_specific_use_code(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "site_specific_use")

    @staticmethod
    def resolve_aspect_code(obj: IAPPSite):
        aspect = prefetch_distinct_list(obj, "site_selections", "aspect", join=False)
        return max(aspect, default=None)

    @staticmethod
    def resolve_slope_code(obj: IAPPSite):
        slope = prefetch_distinct_list(
            obj, "site_selections", "slope_percent", join=False
        )
        return max(slope, default=None)

    @staticmethod
    def resolve_soil_texture_code(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "soil_texture")

    @staticmethod
    def resolve_jurisdictions(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "jurisdictions")

    @staticmethod
    def resolve_access_description(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "site_location")

    @staticmethod
    def resolve_general_comment(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "site_comments")

    @staticmethod
    def resolve_entered_by(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "entered_by")

    @staticmethod
    def resolve_date_entered(obj: IAPPSite):
        date = prefetch_distinct_list(
            obj, "site_selections", "date_entered", join=False
        )
        return min(date, default=None)

    @staticmethod
    def resolve_updated_by(obj: IAPPSite):
        return prefetch_distinct_list(obj, "site_selections", "updated_by")

    @staticmethod
    def resolve_date_updated(obj: IAPPSite):
        date = prefetch_distinct_list(
            obj, "site_selections", "date_updated", join=False
        )
        return max(date, default=None)

    @staticmethod
    def resolve_surveys(obj: IAPPSite) -> List[Any]:
        return []
        return [e for e in obj.surveys.all()]

    @staticmethod
    def resolve_mechanical_treatments(obj: IAPPSite) -> List[Any]:
        return []
        return [e for e in obj.mechanical_treatments.all()]

    @staticmethod
    def resolve_chemical_treatments(obj: IAPPSite) -> List[Any]:
        return []
        return [e for e in obj.chemical_treatments.all()]

    @staticmethod
    def resolve_biological_treatments(obj: IAPPSite) -> List[Any]:
        return []
        return [e for e in obj.biological_treatments.all()]

    @staticmethod
    def resolve_biological_dispersals(obj: IAPPSite) -> List[Any]:
        return []
        return [e for e in obj.biological_dispersals.all()]
