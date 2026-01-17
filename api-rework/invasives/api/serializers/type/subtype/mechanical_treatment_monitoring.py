from rest_framework import serializers
from api.serializers.common import TreatmentMonitoringInfoSerializer


class MechanicalMonitoringSerializer(serializers.Serializer):
    treatment_monitoring_information = serializers.SerializerMethodField()

    def get_treatment_monitoring_information(self, obj):
        return TreatmentMonitoringInfoSerializer(obj, context=self.context).data

    def to_representation(self, instance):
        """Flatten"""
        ret = super().to_representation(instance)
        info_data = ret.pop("treatment_monitoring_information", None)

        if info_data and isinstance(info_data, dict):
            ret.update(info_data)
        return ret
