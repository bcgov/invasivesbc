from typing import Optional
from datetime import datetime
from api.protocol.activity.plants_out.subtypes import _serialize_html_date_time
from api.models.activity import ChemicalTreatmentContext, DraftChemicalTreatmentContext
from ninja import Schema

type Record = ChemicalTreatmentContext | DraftChemicalTreatmentContext


class ChemicalTreatmentContextOut(Schema):
    pesticide_use_permit: Optional[str]
    pest_management_plan: Optional[str]
    pest_management_plan_manual: Optional[str]
    pesticide_employer_code: Optional[str]
    temperature_c: Optional[int]
    wind_speed_kmh: Optional[int]
    application_start_time: Optional[datetime]
    wind_direction: Optional[str]
    humidity: Optional[int]
    treatment_notice_signs: Optional[str]
    precautionary_statement: Optional[str]
    ntz_reduction: Optional[bool]
    rationale_for_ntz_reduction: Optional[str]
    additional_unmapped_well_water: Optional[bool]
    pest_injury_threshold_determination: Optional[bool]

    @staticmethod
    def resolve_application_start_time(obj: Record):
        return _serialize_html_date_time(obj.application_start_time)

    @staticmethod
    def resolve_pesticide_use_permit(obj: Record):
        return obj.pesticide_use_permit.code if obj.pesticide_use_permit else None

    @staticmethod
    def resolve_pest_management_plan(obj: Record):
        return obj.pest_management_plan.code if obj.pest_management_plan else None

    @staticmethod
    def resolve_pesticide_employer_code(obj: Record):
        return obj.pesticide_employer_code.code if obj.pesticide_employer_code else None

    @staticmethod
    def resolve_wind_direction(obj: Record):
        return obj.wind_direction.code if obj.wind_direction else None

    @staticmethod
    def resolve_precautionary_statement(obj: Record):
        return obj.precautionary_statement.code if obj.precautionary_statement else None
