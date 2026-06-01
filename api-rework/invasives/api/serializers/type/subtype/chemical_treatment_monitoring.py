from rest_framework import serializers

from api.models import activity
from api.models.activity import (
    WellEntry,
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
)
from api.serializers.common import (
    NearestWellSerializer,
    TerrestrialTreatmentMonitoringSerializer,
    AquaticTreatmentMonitoringSerializer,
)


class ChemicalMonitoringSerializer(serializers.Serializer):
    entries = serializers.SerializerMethodField()
    well_entries = serializers.SerializerMethodField()

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

    def get_well_entries(self, obj):
        children = WellEntry.objects.filter(activity_data_record__activity_id=obj.id)
        return NearestWellSerializer(children, many=True).data
