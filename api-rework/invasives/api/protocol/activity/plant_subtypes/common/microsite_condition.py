from api.protocol.activity.plant_subtypes.base_form_schema import CleanSchema
from api.protocol.activity.validators.code_validation import (
    MesoslopePositionCodeType,
    SiteSurfaceShapeCodeType
)

class MicrositeCondition(CleanSchema):
    mesoslope_position: MesoslopePositionCodeType
    site_surface_shape: SiteSurfaceShapeCodeType
