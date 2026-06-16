from rest_framework import serializers
from api.serializers.plant_write_serializers import ActivityWriteSerializer
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    AquaticTreatmentMonitoringEntry,
    TerrestrialTreatmentMonitoringEntry,
)
from api.models.codes import AquaticPlantCode
from api.models.activity.monitoring.plant_treatment_monitoring import (
    InvasivePlantsOnSite,
)


class InvasivePlantsOnSiteWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvasivePlantsOnSite
        fields = ("invasive_plants_on_site",)


class TerrestrialTreatmentMonitoringWriteSerializer(serializers.ModelSerializer):
    invasive_plants_on_site = InvasivePlantsOnSiteWriteSerializer(many=True)

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


class AquaticTreatmentMonitoringWriteSerializer(serializers.ModelSerializer):
    invasive_plants_on_site = InvasivePlantsOnSiteWriteSerializer(many=True)
    # Alias field to map from Incoming data into proper format
    invasive_plant_aquatic = serializers.PrimaryKeyRelatedField(
        source="invasive_plant",
        queryset=AquaticPlantCode.objects.all(),
    )

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


class MonitoringSubtypeDataWriteSerializer(serializers.Serializer):
    terrestrial_entries = TerrestrialTreatmentMonitoringWriteSerializer(
        many=True, required=False, default=list
    )
    aquatic_entries = AquaticTreatmentMonitoringWriteSerializer(
        many=True, required=False, default=list
    )

    def to_internal_value(self, data):
        entries = data.get("entries", [])

        terrestrial = []
        aquatic = []

        for entry in entries:
            if entry["invasive_plant"]:
                terrestrial.append(entry)
            elif entry["invasive_plant_aquatic"]:
                aquatic.append(entry)

        structured_data = {
            "terrestrial_entries": terrestrial,
            "aquatic_entries": aquatic,
        }
        return super().to_internal_value(structured_data)


class MonitoringChemicalMechanicalWriteSerializer(ActivityWriteSerializer):
    subtype_data = MonitoringSubtypeDataWriteSerializer(write_only=True, required=True)

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        terrestrial_entries = subtype_data.pop("terrestrial_entries", [])
        aquatic_entries = subtype_data.pop("aquatic_entries", [])

        adr = ActivityDataRecord.objects.create(activity=parent)

        for entry in terrestrial_entries:
            plants_on_site = entry.pop("invasive_plants_on_site", [])
            adr = ActivityDataRecord.objects.create(activity=parent)
            TerrestrialTreatmentMonitoringEntry.objects.create(
                activity_data_record=adr, **entry
            )

            for plant_name in plants_on_site:
                InvasivePlantsOnSite.objects.create(
                    activity_data_record=adr, **plant_name
                )

        for entry in aquatic_entries:
            plants_on_site = entry.pop("invasive_plants_on_site", [])
            adr = ActivityDataRecord.objects.create(activity=parent)
            AquaticTreatmentMonitoringEntry.objects.create(
                activity_data_record=adr, **entry
            )

            for plant_name in plants_on_site:
                InvasivePlantsOnSite.objects.create(
                    activity_data_record=adr, **plant_name
                )
