from rest_framework import serializers
from api.models.activity import TerrestrialPlantMechanicalTreatment


class TerrestrialPlantMechanicalTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerrestrialPlantMechanicalTreatment
        fields = (
            "disposed_material_amount",
            "disposed_material_format",
            "disposal_method",
            "invasive_plant",
            "mechanical_method",
            "treated_area_msq",
        )


class TerrestrialPlantTreatmentMechanicalSerializer(serializers.Serializer):
    entries = TerrestrialPlantMechanicalTreatmentSerializer(
        source="terrestrialplantmechanicaltreatment_set", many=True
    )
