from rest_framework import serializers

from api.models.activity import (
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
)
from api.models.activity.monitoring.plant_treatment_monitoring import (
    InvasivePlantsOnSite,
)


class InvasivePlantsOnSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvasivePlantsOnSite
        fields = ("invasive_plants_on_site",)


class TerrestrialTreatmentMonitoringSerializer(serializers.ModelSerializer):

    invasive_plants_on_site = serializers.SerializerMethodField()

    def get_invasive_plants_on_site(self, obj):
        children = InvasivePlantsOnSite.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return InvasivePlantsOnSiteSerializer(children, many=True).data

    class Meta:
        model = TerrestrialTreatmentMonitoringEntry
        fields = (
            "evidence_of_treatment",
            "treatment_pass",
            "comment",
            "invasive_plant",
            "invasive_plants_on_site",
            "management_efficacy_rating",
            "treatment_efficacy_rating",
        )


class AquaticTreatmentMonitoringSerializer(serializers.ModelSerializer):
    invasive_plants_on_site = serializers.SerializerMethodField()
    invasive_plant_aquatic = serializers.CharField(source="invasive_plant")

    def get_invasive_plants_on_site(self, obj):
        children = InvasivePlantsOnSite.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return InvasivePlantsOnSiteSerializer(children, many=True).data

    class Meta:
        model = AquaticTreatmentMonitoringEntry
        fields = (
            "evidence_of_treatment",
            "treatment_pass",
            "comment",
            "invasive_plant_aquatic",
            "invasive_plants_on_site",
            "management_efficacy_rating",
            "treatment_efficacy_rating",
        )
