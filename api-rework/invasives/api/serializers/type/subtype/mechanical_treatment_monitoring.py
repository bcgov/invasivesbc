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
    entries = serializers.SerializerMethodField()

    def get_entries(self, obj):
        terrestrial_queryset = TerrestrialTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        terrestrial_data = TerrestrialTreatmentMonitoringSerializer(
            terrestrial_queryset, many=True
        ).data

        aquatic_queryset = AquaticTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        aquatic_data = AquaticTreatmentMonitoringSerializer(
            aquatic_queryset, many=True
        ).data

        return list(terrestrial_data) + list(aquatic_data)
