from rest_framework import serializers
from api.models.activity import AquaticPlantMechanicalTreatment
from api.serializers.common import ShorelineTypesSerializer


class AquaticPlantMechanicalTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AquaticPlantMechanicalTreatment
        fields = (
            "disposed_material_amount",
            "disposed_material_format",
            "disposal_method",
            "invasive_plant",
            "mechanical_method",
            "treated_area_msq",
        )


class AquaticPlantTreatmentMechanicalSerializer(serializers.Serializer):
    entries = AquaticPlantMechanicalTreatmentSerializer(
        source="aquaticplantmechanicaltreatment_set", many=True
    )
    authorization_info = serializers.CharField(
        source="aquaticmechanicalauthorization.authorization_information"
    )
    shoreline_types = ShorelineTypesSerializer(source="shorelinetypes_set", many=True)
