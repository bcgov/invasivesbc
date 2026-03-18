from api.legacy_db.mappings.conditions import (
    add_microsite_conditions,
    add_weather_conditions,
)
from api.legacy_db.mappings.participants import add_persons
from api.legacy_db.mappings.plants import add_target_plant_phenology
from api.legacy_db.mappings.spread import add_spread_details
from api.legacy_db.mappings.wells import add_well_information
from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    Activity,
    TerrestrialBiocontrolReleaseEntry,
    TerrestrialBiocontrolAgentCount,
    TerrestrialBiocontrolCollectionEntry,
    TerrestrialBiocontrolDispersalMonitoringEntry,
    TerrestrialBiocontrolAgentCountExtended,
    SignOfBiocontrolPresenceTerrestrial,
    LocationBiocontrolAgentsFoundTerrestrial,
)
from api.models.codes import (
    TerrestrialPlantCode,
    BiocontrolAgentCode,
    BioAgentLifeStageCode,
    BioAgentCollectionMethodCode,
    AgentLocationFoundCode,
    PlantPositionCode,
    BioAgentMonitoringMethodCode,
    BiocontrolPresenceCode,
    AgentLocationFoundTerrainCode,
)


def add_subtype_payload_for_biocontrol_release(new: Activity, old: LegacyActivity):
    add_persons(new, old)
    add_well_information(new, old)
    add_microsite_conditions(new, old)
    add_weather_conditions(new, old)
    add_target_plant_phenology(new, old)

    for (
        bcr
    ) in (
        old.activity_payload.form_data.activity_subtype_data.Biocontrol_Release_Information
    ):
        TerrestrialBiocontrolReleaseEntry.objects.create(
            activity=new,
            invasive_plant=TerrestrialPlantCode.objects.get(
                code=bcr.invasive_plant_code
            ),
            biocontrol_agent=BiocontrolAgentCode.objects.get(
                code=bcr.biological_agent_code
            ),
            linear_segment=bcr.linear_segment,
            mortality=bcr.mortality,
            agent_source=bcr.agent_source,
            collection_date=bcr.collection_date,
            plant_collected_from=(
                TerrestrialPlantCode.objects.get(code=bcr.plant_collected_from)
                if bcr.plant_collected_from is not None
                else None
            ),
            plant_collected_from_manual=(
                bcr.plant_collected_from_unlisted
                if (
                    bcr.plant_collected_from_unlisted is not None
                    and bcr.plant_collected_from_unlisted.strip() != ""
                )
                else None
            ),
        )
        if bcr.estimated_biological_agents is not None:
            for ba in bcr.estimated_biological_agents:
                TerrestrialBiocontrolAgentCount.objects.create(
                    activity=new,
                    is_estimate=True,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=bcr.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=bcr.biological_agent_code
                    ),
                    stage=(
                        BioAgentLifeStageCode.objects.get(
                            code=ba.biological_agent_stage_code
                        )
                        if ba.biological_agent_stage_code is not None
                        else None
                    ),
                    quantity=ba.release_quantity,
                )
        if bcr.actual_biological_agents is not None:
            for ba in bcr.actual_biological_agents:
                TerrestrialBiocontrolAgentCount.objects.create(
                    activity=new,
                    is_estimate=False,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=bcr.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=bcr.biological_agent_code
                    ),
                    stage=(
                        BioAgentLifeStageCode.objects.get(
                            code=ba.biological_agent_stage_code
                        )
                        if ba.biological_agent_stage_code is not None
                        else None
                    ),
                    quantity=ba.release_quantity,
                )


def add_subtype_payload_for_biocontrol_collection(new: Activity, old: LegacyActivity):
    add_persons(new, old)
    add_well_information(new, old)
    add_weather_conditions(new, old)
    add_target_plant_phenology(new, old)
    for (
        bcc
    ) in (
        old.activity_payload.form_data.activity_subtype_data.Biocontrol_Collection_Information
    ):
        TerrestrialBiocontrolCollectionEntry.objects.create(
            activity=new,
            invasive_plant=TerrestrialPlantCode.objects.get(
                code=bcc.invasive_plant_code
            ),
            biological_agent=BiocontrolAgentCode.objects.get(
                code=bcc.biological_agent_code
            ),
            historical_iapp_site=bcc.historical_iapp_site_id,
            collection_type=bcc.collection_type,
            plant_count_collection=bcc.plant_count,
            collection_method=BioAgentCollectionMethodCode.objects.get(
                code=bcc.collection_method
            ),
            number_of_sweeps=bcc.num_of_sweeps,
            comment=bcc.comment,
            start_time_collecting=bcc.start_time,
            end_time_collecting=bcc.stop_time,
        )
        if bcc.estimated_biological_agents is not None:
            for ba in bcc.estimated_biological_agents:
                TerrestrialBiocontrolAgentCount.objects.create(
                    activity=new,
                    is_estimate=True,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=bcc.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=bcc.biological_agent_code
                    ),
                    stage=(
                        BioAgentLifeStageCode.objects.get(
                            code=ba.biological_agent_stage_code
                        )
                        if ba.biological_agent_stage_code is not None
                        else None
                    ),
                    quantity=ba.release_quantity,
                )
        if bcc.actual_biological_agents is not None:
            for ba in bcc.actual_biological_agents:
                TerrestrialBiocontrolAgentCount.objects.create(
                    activity=new,
                    is_estimate=False,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=bcc.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=bcc.biological_agent_code
                    ),
                    stage=(
                        BioAgentLifeStageCode.objects.get(
                            code=ba.biological_agent_stage_code
                        )
                        if ba.biological_agent_stage_code is not None
                        else None
                    ),
                    quantity=ba.release_quantity,
                )


def add_subtype_payload_for_biocontrol_dispersal_monitoring_terrestrial_plant(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)
    add_microsite_conditions(new, old)
    add_weather_conditions(new, old)
    add_target_plant_phenology(new, old)

    for (
        ri
    ) in (
        old.activity_payload.form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information
    ):
        TerrestrialBiocontrolDispersalMonitoringEntry.objects.create(
            activity=new,
            invasive_plant=TerrestrialPlantCode.objects.get(
                code=ri.invasive_plant_code
            ),
            biocontrol_agent=BiocontrolAgentCode.objects.get(
                code=ri.biological_agent_code
            ),
            biocontrol_present=ri.biocontrol_present,
            monitoring_type=ri.monitoring_type,
            monitoring_method=BioAgentMonitoringMethodCode.objects.get(
                code=ri.biocontrol_monitoring_methods_code
            ),
            number_of_sweeps=ri.num_of_sweeps,
            linear_segment=ri.linear_segment,
            start_time=ri.start_time,
            stop_time=ri.stop_time,
            suitable_for_collection=ri.suitable_collection_site,
        )
        if ri.estimated_biological_agents is not None:
            for ba in ri.estimated_biological_agents:
                TerrestrialBiocontrolAgentCountExtended.objects.create(
                    activity=new,
                    is_estimate=True,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=ri.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=ri.biological_agent_code
                    ),
                    stage=(
                        BioAgentLifeStageCode.objects.get(
                            code=ba.biological_agent_stage_code
                        )
                        if ba.biological_agent_stage_code is not None
                        else None
                    ),
                    agent_location=AgentLocationFoundCode.objects.get(
                        code=ba.agent_location
                    ),
                    plant_position=PlantPositionCode.objects.get(
                        code=ba.plant_position
                    ),
                    quantity=ba.release_quantity,
                )
        if ri.actual_biological_agents is not None:
            for ba in ri.actual_biological_agents:
                TerrestrialBiocontrolAgentCountExtended.objects.create(
                    activity=new,
                    is_estimate=False,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=ri.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=ri.biological_agent_code
                    ),
                    stage=(
                        BioAgentLifeStageCode.objects.get(
                            code=ba.biological_agent_stage_code
                        )
                        if ba.biological_agent_stage_code is not None
                        else None
                    ),
                    agent_location=AgentLocationFoundCode.objects.get(
                        code=ba.agent_location
                    ),
                    plant_position=PlantPositionCode.objects.get(
                        code=ba.plant_position
                    ),
                    quantity=ba.release_quantity,
                )


def add_subtype_payload_for_biocontrol_release_monitoring_terrestrial_plant(
    new: Activity, old: LegacyActivity
):
    add_persons(new, old)
    add_well_information(new, old)
    add_microsite_conditions(new, old)
    add_weather_conditions(new, old)
    add_target_plant_phenology(new, old)
    add_spread_details(new, old)

    for (
        ri
    ) in (
        old.activity_payload.form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information
    ):
        TerrestrialBiocontrolDispersalMonitoringEntry.objects.create(
            activity=new,
            invasive_plant=TerrestrialPlantCode.objects.get(
                code=ri.invasive_plant_code
            ),
            biocontrol_agent=BiocontrolAgentCode.objects.get(
                code=ri.biological_agent_code
            ),
            biocontrol_present=ri.biocontrol_present,
            monitoring_type=ri.monitoring_type,
            monitoring_method=BioAgentMonitoringMethodCode.objects.get(
                code=ri.biocontrol_monitoring_methods_code
            ),
            plant_count=ri.plant_count,
            number_of_sweeps=ri.num_of_sweeps,
            start_time=ri.start_time,
            stop_time=ri.stop_time,
            suitable_for_collection=ri.suitable_collection_site,
        )
        if ri.bio_agent_location_code is not None:
            for p in ri.bio_agent_location_code.split(","):
                LocationBiocontrolAgentsFoundTerrestrial.objects.create(
                    activity=new,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=ri.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=ri.biological_agent_code
                    ),
                    location_agent_found=AgentLocationFoundTerrainCode.objects.get(
                        code=p
                    ),
                )
        if ri.biological_agent_presence_code is not None:
            for p in ri.biological_agent_presence_code.split(","):
                SignOfBiocontrolPresenceTerrestrial.objects.create(
                    activity=new,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=ri.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=ri.biological_agent_code
                    ),
                    sign_of_presence=BiocontrolPresenceCode.objects.get(code=p),
                )
        if ri.actual_biological_agents is not None:
            for ba in ri.actual_biological_agents:
                TerrestrialBiocontrolAgentCountExtended.objects.create(
                    activity=new,
                    is_estimate=False,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=ri.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=ri.biological_agent_code
                    ),
                    stage=(
                        BioAgentLifeStageCode.objects.get(
                            code=ba.biological_agent_stage_code
                        )
                        if ba.biological_agent_stage_code is not None
                        else None
                    ),
                    agent_location=AgentLocationFoundCode.objects.get(
                        code=ba.agent_location
                    ),
                    plant_position=PlantPositionCode.objects.get(
                        code=ba.plant_position
                    ),
                    quantity=ba.release_quantity,
                )
        if ri.estimated_biological_agents is not None:
            for ba in ri.estimated_biological_agents:
                TerrestrialBiocontrolAgentCountExtended.objects.create(
                    activity=new,
                    is_estimate=True,
                    invasive_plant=TerrestrialPlantCode.objects.get(
                        code=ri.invasive_plant_code
                    ),
                    biocontrol_agent=BiocontrolAgentCode.objects.get(
                        code=ri.biological_agent_code
                    ),
                    stage=(
                        BioAgentLifeStageCode.objects.get(
                            code=ba.biological_agent_stage_code
                        )
                        if ba.biological_agent_stage_code is not None
                        else None
                    ),
                    agent_location=AgentLocationFoundCode.objects.get(
                        code=ba.agent_location
                    ),
                    plant_position=PlantPositionCode.objects.get(
                        code=ba.plant_position
                    ),
                    quantity=ba.release_quantity,
                )
