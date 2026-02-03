from rest_framework import serializers
from api.serializers.common import (
    TreatmentMonitoringEntriesSerializer,
    NearestWellSerializer,
)


class ChemicalMonitoringSerializer(serializers.Serializer):
    entries = serializers.SerializerMethodField()
    well_entries = NearestWellSerializer(source="nearestwell_set", many=True)

    def get_entries(self, obj):
        return TreatmentMonitoringEntriesSerializer(obj, context=self.context).data

    def to_representation(self, instance):
        """Flatten"""
        ret = super().to_representation(instance)
        info_data = ret.pop("entries", None)

        if info_data and isinstance(info_data, dict):
            ret.update(info_data)
        return ret
