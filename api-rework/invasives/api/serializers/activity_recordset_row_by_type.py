from . import ActivityRecordsetRowSerializer
from rest_framework import serializers
from api.models.activity import ActivityType


class ActivityRecordSetRowByType(serializers.Serializer):
    observations = serializers.SerializerMethodField()
    treatments = serializers.SerializerMethodField()
    monitoring = serializers.SerializerMethodField()
    biocontrol = serializers.SerializerMethodField()

    def get_observations(self, obj):
        return ActivityRecordsetRowSerializer(
            obj.filter(type=ActivityType.Observation.value), many=True
        ).data

    def get_treatments(self, obj):
        return ActivityRecordsetRowSerializer(
            obj.filter(type=ActivityType.Treatment.value), many=True
        ).data

    def get_monitoring(self, obj):
        return ActivityRecordsetRowSerializer(
            obj.filter(type=ActivityType.Monitoring.value), many=True
        ).data

    def get_biocontrol(self, obj):
        return ActivityRecordsetRowSerializer(
            obj.filter(type=ActivityType.Biocontrol.value), many=True
        ).data
