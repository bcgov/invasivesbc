from rest_framework import serializers
from api.serializers.common import (
    NearestWellSerializer,
    ChemicalTreatmentContextSerializer,
)


class AquaticChemicalTreatmentSerializer(serializers.Serializer):
    context = ChemicalTreatmentContextSerializer(source="chemtreatment")
    well_entries = NearestWellSerializer(source="nearestwell_set", many=True)
    entries = serializers.SerializerMethodField()

    def get_treatment_chemical_details(self, obj):
        # TODO:
        return "NOT IMPLEMENTED"

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        info_data = ret.pop("context", None)
        if info_data and isinstance(info_data, dict):
            ret.update(info_data)
        return ret
