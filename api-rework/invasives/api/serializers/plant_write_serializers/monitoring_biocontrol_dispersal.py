from api.serializers.plant_write_serializers import ActivityWriteSerializer
from rest_framework import serializers
from api.models.activity import (
    TerrestrialBiocontrolDispersalMonitoringEntry,
    TargetPlantHeights,
    TargetPlantPhenology,
    MicrositeCondition,
    WeatherConditions,
    TerrestrialBiocontrolAgentCountExtended,
    LocationBiocontrolAgentsFoundTerrestrial,
    SignOfBiocontrolPresenceTerrestrial,
    Activity,
    ActivityDataRecord,
)
from .common import (
    MicrositeConditionsSerializer,
    TerrestrialBiocontrolAgentCountExtendedWriteSerializer,
    TargetPlantPhenologyWriteSerializer,
    WeatherConditionsSerializer,
)
from api.models.codes import AgentLocationFoundTerrainCode, BiocontrolPresenceCode


class EntrySerializer(serializers.ModelSerializer):
    actual_biological_agents = TerrestrialBiocontrolAgentCountExtendedWriteSerializer(
        many=True, allow_empty=True
    )
    estimated_biological_agents = (
        TerrestrialBiocontrolAgentCountExtendedWriteSerializer(
            many=True, allow_empty=True
        )
    )
    location_agent_found = serializers.SlugRelatedField(
        many=True,
        allow_empty=True,
        allow_null=True,
        slug_field="code",
        queryset=AgentLocationFoundTerrainCode.objects.all(),
    )
    sign_of_biocontrol_presence = serializers.SlugRelatedField(
        many=True,
        allow_empty=True,
        allow_null=True,
        slug_field="code",
        queryset=BiocontrolPresenceCode.objects.all(),
    )

    class Meta:
        model = TerrestrialBiocontrolDispersalMonitoringEntry
        fields = (
            "biocontrol_agent",
            "biocontrol_present",
            "invasive_plant",
            "monitoring_type",
            "monitoring_method",
            "count_duration_minutes",
            "location_agent_found",
            "sign_of_biocontrol_presence",
            "start_time",
            "stop_time",
            "suitable_for_collection",
            "plant_count",
            "number_of_sweeps",
            "linear_segment",
            "estimated_biological_agents",
            "actual_biological_agents",
        )


class SubtypeSerializer(serializers.Serializer):
    entries = EntrySerializer(required=True, many=True)
    target_plant_phenology = TargetPlantPhenologyWriteSerializer(
        required=False, allow_null=True
    )
    microsite_conditions = MicrositeConditionsSerializer(required=True)
    weather_conditions = WeatherConditionsSerializer(required=True)


class MonitoringBiocontrolDispersal(ActivityWriteSerializer):
    subtype_data = SubtypeSerializer(write_only=True, required=True)

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        tpp = subtype_data.get("target_plant_phenology")
        if tpp:
            plant_heights = tpp.pop("target_plant_heights")
            TargetPlantPhenology.objects.create(activity_data_record=adr, **tpp)

            TargetPlantHeights.objects.bulk_create(
                TargetPlantHeights(activity_data_record=adr, **tph)
                for tph in plant_heights
            )
        mc = subtype_data.get("microsite_conditions")
        if mc:
            MicrositeCondition.objects.create(activity_data_record=adr, **mc)

        wc = subtype_data.get("weather_conditions")
        if wc:
            WeatherConditions.objects.create(activity_data_record=adr, **wc)

        for entry in subtype_data.get("entries", []):
            aba = entry.pop("actual_biological_agents", [])
            eba = entry.pop("estimated_biological_agents", [])
            laf = entry.pop("location_agent_found", [])
            sobc = entry.pop("sign_of_biocontrol_presence", [])
            adr = ActivityDataRecord.objects.create(activity=parent)
            TerrestrialBiocontrolDispersalMonitoringEntry.objects.create(
                activity_data_record=adr, **entry
            )
            TerrestrialBiocontrolAgentCountExtended.objects.bulk_create(
                TerrestrialBiocontrolAgentCountExtended(
                    activity_data_record=adr, is_estimate=False, **count
                )
                for count in aba
            )
            TerrestrialBiocontrolAgentCountExtended.objects.bulk_create(
                TerrestrialBiocontrolAgentCountExtended(
                    activity_data_record=adr, is_estimate=True, **count
                )
                for count in eba
            )
            LocationBiocontrolAgentsFoundTerrestrial.objects.bulk_create(
                LocationBiocontrolAgentsFoundTerrestrial(
                    activity_data_record=adr, location_agent_found=loc
                )
                for loc in laf
            )
            SignOfBiocontrolPresenceTerrestrial.objects.bulk_create(
                SignOfBiocontrolPresenceTerrestrial(
                    activity_data_record=adr, sign_of_presence=sign
                )
                for sign in sobc
            )
