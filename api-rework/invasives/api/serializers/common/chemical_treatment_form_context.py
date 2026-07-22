from rest_framework import serializers
from api.models.activity import ChemicalTreatmentContext, DraftChemicalTreatmentContext


class BaseSerializer(serializers.ModelSerializer):
    application_start_time = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")

    class Meta:
        abstract = True
        fields = (
            "pesticide_use_permit",
            "pest_management_plan",
            "pest_management_plan_manual",
            "pesticide_employer_code",
            "temperature_c",
            "wind_speed_kmh",
            "application_start_time",
            "wind_direction",
            "humidity",
            "treatment_notice_signs",
            "precautionary_statement",
            "ntz_reduction",
            "rationale_for_ntz_reduction",
            "additional_unmapped_well_water",
            "pest_injury_threshold_determination",
        )


class ChemicalTreatmentFormContextSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ChemicalTreatmentContext


class DraftChemicalTreatmentFormContextSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftChemicalTreatmentContext
