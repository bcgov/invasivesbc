from ninja import Schema
from typing import Optional
from api.models.activity import (
    Activity,
    DraftActivity,
    MicrositeCondition,
    DraftMicrositeCondition,
)

type Microsite = MicrositeCondition | DraftMicrositeCondition


##########
#   Microsites
####
class MicrositeConditionOut(Schema):
    mesoslope_position: Optional[str]
    site_surface_shape: Optional[str]

    @staticmethod
    def resolve_mesoslope_position(obj: Microsite):
        return obj.mesoslope_position.code if obj.mesoslope_position else None

    @staticmethod
    def resolve_site_surface_shape(obj: Microsite):
        return obj.site_surface_shape.code if obj.site_surface_shape else None


class MicrositeConditionOutMixin(Schema):
    microsite_conditions: MicrositeConditionOut

    @staticmethod
    def resolve_microsite_conditions(obj: Activity):
        return MicrositeCondition.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()


class DraftMicrositeConditionOutMixin(MicrositeConditionOutMixin):
    @staticmethod
    def resolve_microsite_conditions(obj: DraftActivity):
        return DraftMicrositeCondition.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
