from rest_framework import serializers
from api.serializers.common import (
    NearestWellSerializer,
    ChemicalTreatmentContextSerializer,
)


class TerrestrialChemicalTreatmentSerializer(serializers.Serializer):
    details = ChemicalTreatmentContextSerializer(source="chemtreatmentcontext")
    well_entries = NearestWellSerializer(source="wellentry_set", many=True)
    entries = serializers.SerializerMethodField()

    def get_entries(self, obj):
        # TODO:
        return "NOT IMPLEMENTED"

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        info_data = ret.pop("details", None)
        if info_data and isinstance(info_data, dict):
            ret.update(info_data)
        return ret
