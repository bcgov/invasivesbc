from rest_framework import serializers

from api.models.codes import (
    SpecificUseCode,
    SoilTextureCode,
    AspectCode,
    SlopePercentCode,
    TerrestrialPlantCode,
    AquaticPlantCode,
    HerbicideApplicationMethodCode,
    HerbicideTypeCode,
    GranularHerbicideCode,
    LiquidHerbicideCode,
    InvasivePlantsOnSiteCode,
)


class BaseCodeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "code",
            "full",
        )


class SpecificUseCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = SpecificUseCode
        fields = BaseCodeSerializer.Meta.fields


class SoilTextureCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = SoilTextureCode
        fields = BaseCodeSerializer.Meta.fields


class AspectCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = AspectCode
        fields = BaseCodeSerializer.Meta.fields


class SlopeCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = SlopePercentCode
        fields = BaseCodeSerializer.Meta.fields


class TerrestrialPlantCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = TerrestrialPlantCode
        fields = BaseCodeSerializer.Meta.fields


class AquaticPlantCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = AquaticPlantCode
        fields = BaseCodeSerializer.Meta.fields


class InvasivePlantsOnSiteCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = InvasivePlantsOnSiteCode
        fields = BaseCodeSerializer.Meta.fields


class LiquidHerbicideCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = LiquidHerbicideCode
        fields = BaseCodeSerializer.Meta.fields


class GranularHerbicideCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = GranularHerbicideCode
        fields = BaseCodeSerializer.Meta.fields


class HerbicideTypeCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = HerbicideTypeCode
        fields = BaseCodeSerializer.Meta.fields


class HerbicideApplicationMethodCodeSerializer(BaseCodeSerializer):
    class Meta:
        model = HerbicideApplicationMethodCode
        fields = BaseCodeSerializer.Meta.fields
