from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolAgentCountExtended,
    TerrestrialBiocontrolAgentCount,
    DraftTerrestrialBiocontrolAgentCountExtended,
    DraftTerrestrialBiocontrolAgentCount,
)


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = (
            "quantity",
            "stage",
        )


class BaseExtendedSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        abstract = True
        fields = (
            *BaseSerializer.Meta.fields,
            "plant_position",
            "agent_location",
        )


class TerrestrialBiocontrolAgentCountSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftTerrestrialBiocontrolAgentCount


class DraftTerrestrialBiocontrolAgentCountSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = TerrestrialBiocontrolAgentCount


class TerrestrialBiocontrolAgentCountExtendedSerializer(BaseExtendedSerializer):
    class Meta(BaseExtendedSerializer.Meta):
        model = TerrestrialBiocontrolAgentCountExtended


class DraftTerrestrialBiocontrolAgentCountExtendedSerializer(BaseExtendedSerializer):

    class Meta(BaseExtendedSerializer.Meta):
        model = DraftTerrestrialBiocontrolAgentCountExtended
