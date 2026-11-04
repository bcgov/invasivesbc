import uuid, random
from api.models.activity import ActivitySubtypes
from api.tests.factories.plants.common import (
    build_mock_base,
    build_treatment_context_tank_mix_on,
    build_treatment_context_tank_mix_off,
    build_chemical_record_context,
    build_well_entries,
)
from api.models.codes import TerrestrialPlantCode


def build_treatment_chemical_terrestrial(
    subject, subtype: ActivitySubtypes, linking_activities, form_id: uuid = uuid.uuid4()
):
    arg = {"plant_code_model": TerrestrialPlantCode}
    coin_flip = random.random() > 0.5
    return {
        **build_mock_base(
            subject=subject,
            subtype=subtype,
            linking_activities=linking_activities,
            form_id=form_id,
        ),
        "subtype_data": {
            "treatment_context": (
                build_treatment_context_tank_mix_off(**arg)
                if coin_flip
                else build_treatment_context_tank_mix_on(**arg)
            ),
            "context": build_chemical_record_context(),
            "well_entries": build_well_entries(),
        },
    }
