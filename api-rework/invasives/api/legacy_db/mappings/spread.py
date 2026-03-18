from api.legacy_db.model_serializer import LegacyActivity
from api.models.activity import Activity, SpreadResults


def add_spread_details(
    new: Activity,
    old: LegacyActivity,
):
    spread = old.activity_payload.form_data.activity_subtype_data.Spread_Results
    if spread is None:
        if new.migration_remarks is None:
            new.migration_remarks = ""
        new.migration_remarks += "Spread Results on legacy activity is null\n\n"
        return

    if (
        spread.spread_details_recorded is not None
        and spread.spread_details_recorded == "No"
    ):
        return

    SpreadResults.objects.create(
        activity=new,
        agent_density=spread.agent_density,
        plant_attack=spread.plant_attack,
        max_spread_distance_m=spread.max_spread_distance,
        max_spread_aspect_deg=spread.max_spread_aspect,
    )
