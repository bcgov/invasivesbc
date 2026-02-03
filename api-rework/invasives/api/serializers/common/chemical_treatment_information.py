from rest_framework import serializers
from api.models.activity import ChemTreatmentContext


class ChemicalTreatmentContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChemTreatmentContext
        fields = (
            "service_license_number",
            "pesticide_use_permit",
            "pest_management_plan",
            "pest_management_plan_manual",
            "temperature_c",
            "wind_speed_kmh",
            "application_start_time",
            "wind_direction",
            "humidity",
            "treatment_notice_signs",
            "precautionary_statement",
            "ntz_reduction_bool",
            "rationale_for_ntz_reduction",
            "additional_unmapped_well_water_bool",
            "pest_injury_threshold_determination_bool",
        )
