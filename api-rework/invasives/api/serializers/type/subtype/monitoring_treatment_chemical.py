from rest_framework import serializers

from api.models.activity import (
    WellEntry,
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
    DraftWellEntry,
    DraftTerrestrialTreatmentMonitoringEntry,
    DraftAquaticTreatmentMonitoringEntry,
)
from api.serializers.common import (
    NearestWellSerializer,
    TerrestrialTreatmentMonitoringSerializer,
    AquaticTreatmentMonitoringSerializer,
    DraftNearestWellSerializer,
    DraftTerrestrialTreatmentMonitoringSerializer,
    DraftAquaticTreatmentMonitoringSerializer,
)


############
# Serializers for Subtype Data
############
class BaseSerializer(serializers.Serializer):
    entries = serializers.SerializerMethodField()
    well_entries = serializers.SerializerMethodField()

    class Meta:
        abstract = True


class ChemicalMonitoringSerializer(BaseSerializer):
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


class DraftChemicalMonitoringSerializer(BaseSerializer):
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

    def get_well_entries(self, obj):
        children = DraftWellEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return DraftNearestWellSerializer(children, many=True).data
