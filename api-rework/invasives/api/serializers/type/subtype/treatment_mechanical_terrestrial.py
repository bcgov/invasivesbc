from rest_framework import serializers
from api.models.activity import (
    TerrestrialPlantMechanicalTreatmentEntry,
    DraftTerrestrialPlantMechanicalTreatmentEntry,
)


############
# Serializers for Entries
############
class BaseEntrySerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = (
            "disposed_material_amount",
            "disposed_material_format",
            "disposal_method",
            "invasive_plant",
            "mechanical_method",
            "treated_area_msq",
        )


class EntrySerializer(BaseEntrySerializer):
    class Meta(BaseEntrySerializer.Meta):
        model = TerrestrialPlantMechanicalTreatmentEntry


class DraftEntrySerializer(BaseEntrySerializer):

    class Meta(BaseEntrySerializer.Meta):
        model = DraftTerrestrialPlantMechanicalTreatmentEntry


############
# Serializers for Subtype Data
############
class BaseSerializer(serializers.Serializer):
    entries = serializers.SerializerMethodField()


class TerrestrialPlantTreatmentMechanicalSerializer(BaseSerializer):

    def get_entries(self, obj):
        children = TerrestrialPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return EntrySerializer(children, many=True).data


class DraftTerrestrialPlantTreatmentMechanicalSerializer(BaseSerializer):

    def get_entries(self, obj):
        children = DraftTerrestrialPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftEntrySerializer(children, many=True).data
