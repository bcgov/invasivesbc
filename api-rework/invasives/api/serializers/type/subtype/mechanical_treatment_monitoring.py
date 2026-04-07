from rest_framework import serializers

from api.models.activity import (
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
)
from api.serializers.common import (
    TerrestrialTreatmentMonitoringSerializer,
    AquaticTreatmentMonitoringSerializer,
)


class MechanicalMonitoringSerializer(serializers.Serializer):
    terrestrial_entries = serializers.SerializerMethodField()
    aquatic_entries = serializers.SerializerMethodField()

    def get_terrestrial_entries(self, obj):
        children = TerrestrialTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return TerrestrialTreatmentMonitoringSerializer(children, many=True).data

    def get_aquatic_entries(self, obj):
        children = AquaticTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return AquaticTreatmentMonitoringSerializer(children, many=True).data
