import uuid
from api.models.activity import ActivitySubtypes
from api.tests.factories.plants.common import (
    build_mock_base,
    build_monitoring_treatment_entries,
)


def build_monitoring_chemical_treatment(
    subject, subtype: ActivitySubtypes, form_id: uuid = uuid.uuid4()
):
    return {
        **build_mock_base(subject, subtype, form_id),
        "subtype_data": {
            "entries": build_monitoring_treatment_entries(),
        },
    }
