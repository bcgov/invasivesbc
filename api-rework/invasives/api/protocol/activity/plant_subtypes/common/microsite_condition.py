from typing import Optional
from api.protocol.activity.plant_subtypes.base_form_schema import CleanSchema
from api.protocol.activity.validators.code_validation import (
    MesoslopePositionCodeType,
    SiteSurfaceShapeCodeType,
)


class DraftMicrositeCondition(CleanSchema):
    mesoslope_position: Optional[MesoslopePositionCodeType]
    site_surface_shape: Optional[SiteSurfaceShapeCodeType]


class MicrositeCondition(DraftMicrositeCondition):
    mesoslope_position: MesoslopePositionCodeType
    site_surface_shape: SiteSurfaceShapeCodeType
