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
    terrestrial_entries = serializers.SerializerMethodField()
    aquatic_entries = serializers.SerializerMethodField()
    well_entries = serializers.SerializerMethodField()

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

    def get_well_entries(self, obj):
        children = WellEntry.objects.filter(activity_data_record__activity_id=obj.id)
        return NearestWellSerializer(children, many=True).data
