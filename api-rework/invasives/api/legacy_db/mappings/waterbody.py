from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import (
    WaterbodyOutflowPermanent,
    WaterbodyInflowSeasonal,
    WaterbodyInflowPermanent,
    WaterbodyOutflowSeasonal,
    WaterbodySubstrateType,
    WaterbodyLevelManagement,
    WaterbodyUse,
    WaterbodyAdjacentLandUse,
    WaterbodyContext,
    Activity,
    ShorelineTypes,
)
from api.models.codes import (
    WaterbodyFlowSeasonalCode,
    WaterbodyFlowCode,
    WaterbodySubstrateCode,
    WaterbodyUseCode,
    WaterLevelManagement,
    AdjacentLandUseCode,
    WaterbodyTypeCode,
    ShorelineTypeCode,
)


def add_shoreline_types(new: Activity, old: LegacyActivity):
    st_data = old.activity_payload.form_data.activity_subtype_data.ShorelineTypes

    if st_data is None:
        if new.migration_remarks is None:
            new.migration_remarks = ""
        new.migration_remarks += "Shoreline type data on legacy activity is null\n\n"
        return

    for shoreline in st_data:
        if shoreline.shoreline_type is None:
            if new.migration_remarks is None:
                new.migration_remarks = ""
            new.migration_remarks += "Shoreline type code not specified for shoreline entry. Not creating shorelines entry in new record\n\n"
        else:
            ShorelineTypes.objects.create(
                activity=new,
                shoreline_type=(
                    ShorelineTypeCode.objects.get(code=shoreline.shoreline_type)
                ),
                percent_covered=shoreline.percent_covered,
            )


def add_waterbody_data(new: Activity, old: LegacyActivity):
    wb_data = old.activity_payload.form_data.activity_subtype_data.WaterbodyData
    wq_data = old.activity_payload.form_data.activity_subtype_data.WaterQuality

    if wb_data is None:
        if new.migration_remarks is None:
            new.migration_remarks = ""
        new.migration_remarks += "Legacy activity does not provide waterbody data\n\n"
        return

    WaterbodyContext.objects.create(
        activity=new,
        name_gazetted=wb_data.waterbody_name_gazetted,
        name_local=wb_data.waterbody_name_local,
        access=wb_data.waterbody_access,
        type=(
            WaterbodyTypeCode.objects.get(code=wb_data.waterbody_type)
            if wb_data.waterbody_type is not None
            else None
        ),
        secchi_depth=(
            wq_data.secchi_depth
            if wq_data is not None and wq_data.secchi_depth is not None
            else None
        ),
        colour=(
            wq_data.water_colour
            if wq_data is not None and wq_data.water_colour is not None
            else (wb_data.water_colour if wb_data.water_colour is not None else None)
        ),
        tidal_influence=wb_data.tidal_influence,
        comment=wb_data.comment,
    )

    if wb_data.adjacent_land_use is not None:
        for code in wb_data.adjacent_land_use.split(","):
            WaterbodyAdjacentLandUse.objects.create(
                activity=new,
                waterbody_adjacent_land_use=AdjacentLandUseCode.objects.get(code=code),
            )

    if wb_data.water_level_management:
        wlm = wb_data.water_level_management
        if wlm == "Pumping Station":
            wlm = "Station"

            WaterbodyLevelManagement.objects.create(
                activity=new,
                waterlevel_management=WaterLevelManagement.objects.get(code=wlm),
            )

    if wb_data.waterbody_use is not None:
        for code in wb_data.waterbody_use.split(","):
            WaterbodyUse.objects.create(
                activity=new,
                waterbody_use=WaterbodyUseCode.objects.get(code=code),
            )
    else:
        if new.migration_remarks is None:
            new.migration_remarks = ""
        new.migration_remarks += "Waterbody use code was null on legacy activity"

    if wb_data.substrate_type is not None:
        for code in wb_data.substrate_type.split(","):
            WaterbodySubstrateType.objects.create(
                activity=new,
                substrate_type=WaterbodySubstrateCode.objects.get(code=code),
            )

    if wb_data.outflow_other is not None:
        WaterbodyOutflowSeasonal.objects.create(
            activity=new,
            flow_code=WaterbodyFlowCode.objects.get(code=wb_data.outflow_other),
        )
    if wb_data.outflow is not None:
        WaterbodyOutflowPermanent.objects.create(
            activity=new, flow_code=WaterbodyFlowCode.objects.get(code=wb_data.outflow)
        )

    if wb_data.inflow_other is not None:
        WaterbodyInflowSeasonal.objects.create(
            activity=new,
            flow_code=WaterbodyFlowSeasonalCode.objects.get(code=wb_data.inflow_other),
        )

    if wb_data.inflow_permanent is not None:
        WaterbodyInflowPermanent.objects.create(
            activity=new,
            flow_code=WaterbodyFlowCode.objects.get(code=wb_data.inflow_permanent),
        )
