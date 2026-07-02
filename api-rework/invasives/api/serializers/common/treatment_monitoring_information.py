from rest_framework import serializers

from api.serializers.common import (
    InvasivePlantsOnSiteSerializer,
    DraftInvasivePlantsOnSiteSerializer,
)
from api.models.activity import (
    TerrestrialTreatmentMonitoringEntry,
    AquaticTreatmentMonitoringEntry,
    InvasivePlantsOnSite,
    DraftTerrestrialTreatmentMonitoringEntry,
    DraftAquaticTreatmentMonitoringEntry,
    DraftInvasivePlantsOnSite,
)


############
# Serializers for Chem/Mech Treatment Monitoring Entries
############
class BaseEntrySerializer(serializers.ModelSerializer):
    invasive_plants_on_site = serializers.SerializerMethodField()

    class Meta:
        abstract = True
        fields = (
            "evidence_of_treatment",
            "treatment_pass",
            "comment",
            "invasive_plant",
            "invasive_plants_on_site",
            "management_efficacy_rating",
            "treatment_efficacy_rating",
        )


class TerrestrialTreatmentMonitoringSerializer(BaseEntrySerializer):

    def get_invasive_plants_on_site(self, obj):
        children = InvasivePlantsOnSite.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return InvasivePlantsOnSiteSerializer(children, many=True).data

    class Meta(BaseEntrySerializer.Meta):
        model = TerrestrialTreatmentMonitoringEntry


class DraftTerrestrialTreatmentMonitoringSerializer(BaseEntrySerializer):

    def get_invasive_plants_on_site(self, obj):
        children = DraftInvasivePlantsOnSite.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return DraftInvasivePlantsOnSiteSerializer(children, many=True).data

    class Meta(BaseEntrySerializer.Meta):
        model = DraftTerrestrialTreatmentMonitoringEntry


class AquaticTreatmentMonitoringSerializer(BaseEntrySerializer):
    invasive_plant_aquatic = serializers.CharField(source="invasive_plant")

    def get_invasive_plants_on_site(self, obj):
        children = InvasivePlantsOnSite.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return InvasivePlantsOnSiteSerializer(children, many=True).data

    class Meta(BaseEntrySerializer.Meta):
        model = AquaticTreatmentMonitoringEntry
        # programmatically remove invasive_plant field from Meta while maintaining list
        fields = [
            *(
                field
                for field in BaseEntrySerializer.Meta.fields
                if field != "invasive_plant"
            ),
            "invasive_plant_aquatic",
        ]


class DraftAquaticTreatmentMonitoringSerializer(BaseEntrySerializer):
    invasive_plant_aquatic = serializers.CharField(source="invasive_plant")

    def get_invasive_plants_on_site(self, obj):
        children = DraftInvasivePlantsOnSite.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return DraftInvasivePlantsOnSiteSerializer(children, many=True).data

    class Meta(BaseEntrySerializer.Meta):
        model = DraftAquaticTreatmentMonitoringEntry
        # programmatically remove invasive_plant field from Meta while maintaining list
        fields = [
            *(
                field
                for field in BaseEntrySerializer.Meta.fields
                if field != "invasive_plant"
            ),
            "invasive_plant_aquatic",
        ]
