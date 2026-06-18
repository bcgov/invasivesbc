from . import BaseActivityProcessor
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


class MonitoringBiocontrolDispersalIn(BaseActivityProcessor):

    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        phenology = subtype_data.get("target_plant_phenology")
        if phenology:
            plant_heights = phenology.pop("target_plant_heights")
            TargetPlantPhenology.objects.create(activity_data_record=adr, **phenology)

            TargetPlantHeights.objects.bulk_create(
                TargetPlantHeights(activity_data_record=adr, **tph)
                for tph in plant_heights
            )

        microsite = subtype_data.get("microsite_conditions")
        if microsite:
            MicrositeCondition.objects.create(activity_data_record=adr, **microsite)

        wc = subtype_data.get("weather_conditions")
        if wc:
            WeatherConditions.objects.create(activity_data_record=adr, **wc)

        for entry in subtype_data.get("entries", []):
            actual_agents = entry.pop("actual_biological_agents", [])
            estimated_agents = entry.pop("estimated_biological_agents", [])
            location_found = entry.pop("location_agent_found", [])
            sign_of_presence = entry.pop("sign_of_biocontrol_presence", [])
            adr = ActivityDataRecord.objects.create(activity=parent)
            TerrestrialBiocontrolDispersalMonitoringEntry.objects.create(
                activity_data_record=adr, **entry
            )
            TerrestrialBiocontrolAgentCountExtended.objects.bulk_create(
                TerrestrialBiocontrolAgentCountExtended(
                    activity_data_record=adr, **count
                )
                for count in actual_agents
            )
            TerrestrialBiocontrolAgentCountExtended.objects.bulk_create(
                TerrestrialBiocontrolAgentCountExtended(
                    activity_data_record=adr, **count
                )
                for count in estimated_agents
            )
            LocationBiocontrolAgentsFoundTerrestrial.objects.bulk_create(
                LocationBiocontrolAgentsFoundTerrestrial(
                    activity_data_record=adr, location_agent_found=loc
                )
                for loc in location_found
            )
            SignOfBiocontrolPresenceTerrestrial.objects.bulk_create(
                SignOfBiocontrolPresenceTerrestrial(
                    activity_data_record=adr, sign_of_presence=sign
                )
                for sign in sign_of_presence
            )
