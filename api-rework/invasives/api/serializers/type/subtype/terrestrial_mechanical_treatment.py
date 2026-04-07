from rest_framework import serializers
from api.models.activity import TerrestrialPlantMechanicalTreatmentEntry


class TerrestrialPlantMechanicalTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialPlantMechanicalTreatmentEntry
        fields = (
            "disposed_material_amount",
            "disposed_material_format",
            "disposal_method",
            "invasive_plant",
            "mechanical_method",
            "treated_area_msq",
        )


class TerrestrialPlantTreatmentMechanicalSerializer(serializers.Serializer):
    entries = serializers.SerializerMethodField()

    def get_entries(self, obj):
        children = TerrestrialPlantMechanicalTreatmentEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return TerrestrialPlantMechanicalTreatmentSerializer(children, many=True).data
