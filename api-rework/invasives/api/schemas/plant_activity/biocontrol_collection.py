from . import BaseActivityProcessor, DraftBaseActivityProcessor
from api.models.activity import (
    TargetPlantHeights,
    TargetPlantPhenology,
    MicrositeCondition,
    WeatherConditions,
    TerrestrialBiocontrolAgentCount,
    Activity,
    ActivityDataRecord,
    TerrestrialBiocontrolCollectionEntry,
    DraftTargetPlantHeights,
    DraftTargetPlantPhenology,
    DraftMicrositeCondition,
    DraftWeatherConditions,
    DraftTerrestrialBiocontrolAgentCount,
    DraftActivity,
    DraftActivityDataRecord,
    DraftTerrestrialBiocontrolCollectionEntry,
)


class BiocontrolCollectionIn(BaseActivityProcessor):
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

        weather_conditions = subtype_data.get("weather_conditions")
        if weather_conditions:
            WeatherConditions.objects.create(
                activity_data_record=adr, **weather_conditions
            )

        for entry in subtype_data.get("entries", []):
            actual_agents = entry.pop("actual_biological_agents", [])
            estimated_agents = entry.pop("estimated_biological_agents", [])
            adr = ActivityDataRecord.objects.create(activity=parent)
            TerrestrialBiocontrolCollectionEntry.objects.create(
                activity_data_record=adr, **entry
            )
            TerrestrialBiocontrolAgentCount.objects.bulk_create(
                TerrestrialBiocontrolAgentCount(activity_data_record=adr, **count)
                for count in actual_agents
            )
            TerrestrialBiocontrolAgentCount.objects.bulk_create(
                TerrestrialBiocontrolAgentCount(activity_data_record=adr, **count)
                for count in estimated_agents
            )


class DraftBiocontrolCollectionIn(DraftBaseActivityProcessor):
    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: DraftActivity):
        adr = DraftActivityDataRecord.objects.create(activity=parent)
        phenology = subtype_data.get("target_plant_phenology")
        if phenology:
            plant_heights = phenology.pop("target_plant_heights")
            DraftTargetPlantPhenology.objects.create(
                activity_data_record=adr, **phenology
            )

            DraftTargetPlantHeights.objects.bulk_create(
                DraftTargetPlantHeights(activity_data_record=adr, **tph)
                for tph in plant_heights
            )

        microsite = subtype_data.get("microsite_conditions")
        if microsite:
            DraftMicrositeCondition.objects.create(
                activity_data_record=adr, **microsite
            )

        weather_conditions = subtype_data.get("weather_conditions")
        if weather_conditions:
            DraftWeatherConditions.objects.create(
                activity_data_record=adr, **weather_conditions
            )

        for entry in subtype_data.get("entries", []):
            actual_agents = entry.pop("actual_biological_agents", [])
            estimated_agents = entry.pop("estimated_biological_agents", [])
            adr = DraftActivityDataRecord.objects.create(activity=parent)
            DraftTerrestrialBiocontrolCollectionEntry.objects.create(
                activity_data_record=adr, **entry
            )
            DraftTerrestrialBiocontrolAgentCount.objects.bulk_create(
                DraftTerrestrialBiocontrolAgentCount(activity_data_record=adr, **count)
                for count in actual_agents
            )
            DraftTerrestrialBiocontrolAgentCount.objects.bulk_create(
                DraftTerrestrialBiocontrolAgentCount(activity_data_record=adr, **count)
                for count in estimated_agents
            )
