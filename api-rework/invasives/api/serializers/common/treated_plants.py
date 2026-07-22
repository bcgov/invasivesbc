from rest_framework import serializers
from api.models.activity import (
    ChemPlantEntryAquatic,
    ChemPlantEntryTerrestrial,
    DraftChemPlantEntryAquatic,
    DraftChemPlantEntryTerrestrial,
)


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ("percent_covered", "invasive_plant")


class TreatedTerrestrialPlantSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ChemPlantEntryTerrestrial


class TreatedAquaticPlantSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ChemPlantEntryAquatic


class DraftTreatedTerrestrialPlantSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftChemPlantEntryTerrestrial


class DraftTreatedAquaticPlantSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftChemPlantEntryAquatic
