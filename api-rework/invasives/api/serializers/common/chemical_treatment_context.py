from rest_framework import serializers
from api.models.activity import (
    ChemTreatmentContext,
    DraftChemTreatmentContext,
    ChemicalTreatmentContext,
    DraftChemicalTreatmentContext,
    ChemPlantEntryTerrestrial,
    ChemPlantEntryAquatic,
    DraftChemPlantEntryTerrestrial,
    DraftChemPlantEntryAquatic,
    GranularHerbicideEntry,
    LiquidHerbicideEntry,
    DraftGranularHerbicideEntry,
    DraftLiquidHerbicideEntry,
)
from api.serializers.common import (
    GranularHerbicideSerializer,
    LiquidHerbicideSerializer,
    ChemicalTreatmentFormContextSerializer,
    DraftGranularHerbicideSerializer,
    DraftLiquidHerbicideSerializer,
    DraftChemicalTreatmentFormContextSerializer,
    TreatedAquaticPlantSerializer,
    TreatedTerrestrialPlantSerializer,
    DraftTreatedAquaticPlantSerializer,
    DraftTreatedTerrestrialPlantSerializer,
)


class BaseSerializer(serializers.ModelSerializer):
    plants_treated = serializers.SerializerMethodField()
    herbicide = serializers.SerializerMethodField()

    class Meta:
        abstract = True
        fields = (
            "application_method",
            "tank_mix",
            "calculation_type",
            "area_treated_sqm",
            "amount_mix_used_l",
            "delivery_rate",
            "dilution_percent",
            "herbicide",
            "plants_treated",
        )


class ChemicalTreatmentContextSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        abstract = True

    def get_herbicide(self, obj):
        activity_id = obj.activity_data_record.activity_id
        children = LiquidHerbicideEntry.objects.filter(
            activity_data_record__activity_id=activity_id
        )
        liquids = LiquidHerbicideSerializer(children, many=True).data
        children = GranularHerbicideEntry.objects.filter(
            activity_data_record__activity_id=activity_id
        )
        solids = GranularHerbicideSerializer(children, many=True).data

        return list(liquids) + list(solids)


class ChemicalTreatmentContextAquaticSerializer(ChemicalTreatmentContextSerializer):
    class Meta(ChemicalTreatmentContextSerializer.Meta):
        model = ChemTreatmentContext

    def get_plants_treated(self, obj):
        children = ChemPlantEntryAquatic.objects.filter(
            activity_data_record__activity_id=obj.activity_data_record.activity_id
        )
        return TreatedAquaticPlantSerializer(children, many=True).data


class ChemicalTreatmentContextTerrestrialSerializer(ChemicalTreatmentContextSerializer):
    class Meta(ChemicalTreatmentContextSerializer.Meta):
        model = ChemTreatmentContext

    def get_plants_treated(self, obj):
        children = ChemPlantEntryTerrestrial.objects.filter(
            activity_data_record__activity_id=obj.activity_data_record.activity_id
        )
        return TreatedTerrestrialPlantSerializer(children, many=True).data


class DraftChemicalTreatmentContextAquaticSerializer(
    ChemicalTreatmentContextSerializer
):
    class Meta(ChemicalTreatmentContextSerializer.Meta):
        model = DraftChemTreatmentContext

    def get_plants_treated(self, obj):
        children = DraftChemPlantEntryAquatic.objects.filter(
            activity_data_record__activity_id=obj.activity_data_record.activity_id
        )
        return DraftTreatedAquaticPlantSerializer(children, many=True).data


class DraftChemicalTreatmentContextTerrestrialSerializer(
    ChemicalTreatmentContextSerializer
):
    class Meta(ChemicalTreatmentContextSerializer.Meta):
        model = DraftChemTreatmentContext

    def get_plants_treated(self, obj):
        children = DraftChemPlantEntryTerrestrial.objects.filter(
            activity_data_record__activity_id=obj.activity_data_record.activity_id
        )
        return DraftTreatedTerrestrialPlantSerializer(children, many=True).data
