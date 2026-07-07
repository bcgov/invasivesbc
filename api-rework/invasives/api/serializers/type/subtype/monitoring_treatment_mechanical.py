from rest_framework import serializers

from api.models.activity import (
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
    DraftTerrestrialTreatmentMonitoringEntry,
    DraftAquaticTreatmentMonitoringEntry,
)
from api.serializers.common import (
    TerrestrialTreatmentMonitoringSerializer,
    AquaticTreatmentMonitoringSerializer,
    DraftTerrestrialTreatmentMonitoringSerializer,
    DraftAquaticTreatmentMonitoringSerializer,
)


############
# Serializers for Subtype Data
############
class BaseSerializer(serializers.Serializer):
    entries = serializers.SerializerMethodField()

    class Meta:
        abstract = True


class MechanicalMonitoringSerializer(BaseSerializer):
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


class DraftMechanicalMonitoringSerializer(BaseSerializer):
    def get_entries(self, obj):
        terrestrial_queryset = DraftTerrestrialTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        terrestrial_data = DraftTerrestrialTreatmentMonitoringSerializer(
            terrestrial_queryset, many=True
        ).data

        aquatic_queryset = DraftAquaticTreatmentMonitoringEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        aquatic_data = DraftAquaticTreatmentMonitoringSerializer(
            aquatic_queryset, many=True
        ).data

        return list(terrestrial_data) + list(aquatic_data)
