from rest_framework import serializers
from api.models.activity import (
    ChemicalTreatmentContext,
    Herbicide,
    ChemicalTreatmentDetails,
    ChemicalTreatmentTerrestrialInvasivePlantRecord,
    ChemicalTreatmentAquaticInvasivePlantRecord,
    ChemicalTreatmentCalculationResultsRecord,
    ChemicalTreatmentCalculationResultsPerPlantRecord,
    ChemicalTreatmentCalculationResultsPerPlantHerbicideRecord,
    ChemicalTreatmentTankMix,
    ChemicalTreatmentTankMixHerbicide,
)
from api.serializers.common.codes import (
    LiquidHerbicideCodeSerializer,
    GranularHerbicideCodeSerializer,
    HerbicideTypeCodeSerializer,
    AquaticPlantCodeSerializer,
    HerbicideApplicationMethodCodeSerializer,
    TerrestrialPlantCodeSerializer,
)


class HerbicideSerializer(serializers.ModelSerializer):
    liquid_herbicide = LiquidHerbicideCodeSerializer()
    granular_herbicide = GranularHerbicideCodeSerializer()
    herbicide_type = HerbicideTypeCodeSerializer()

    class Meta:
        model = Herbicide
        fields = (
            "index",
            "dilution",
            "amount_of_mix",
            "area_treated_sqm",
            "herbicide_type",
            "liquid_herbicide",
            "granular_herbicide",
        )


class ChemicalTreatmentTerrestrialInvasivePlantRecordSerializer(
    serializers.ModelSerializer
):
    invasive_plant = TerrestrialPlantCodeSerializer()

    class Meta:
        model = ChemicalTreatmentTerrestrialInvasivePlantRecord
        fields = ["index", "invasive_plant", "percent_area_covered"]


class ChemicalTreatmentAquaticInvasivePlantRecordSerializer(
    serializers.ModelSerializer
):
    invasive_plant = AquaticPlantCodeSerializer()

    class Meta:
        model = ChemicalTreatmentAquaticInvasivePlantRecord
        fields = ["index", "invasive_plant", "percent_area_covered"]


class ChemicalTreatmentCalculationResultsPerPlantHerbicideRecordSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ChemicalTreatmentCalculationResultsPerPlantHerbicideRecord
        fields = [
            "plant_index",
            "herbicide_index",
            "dilution",
            "product_application_rate",
            "amount_of_undiluted_herbicide_used_liters",
        ]


class ChemicalTreatmentCalculationResultsPerPlantRecordSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ChemicalTreatmentCalculationResultsPerPlantRecord

        fields = [
            "index",
            "area_treated_sqm",
            "percent_area_covered",
            "amount_of_undiluted_herbicide_used_liters",
        ]


class ChemicalTreatmentCalculationResultsRecordSerializer(serializers.ModelSerializer):
    per_plant_calculations = serializers.SerializerMethodField()
    per_herbicide_calculations = serializers.SerializerMethodField()

    def get_per_plant_calculations(self, obj):
        children = ChemicalTreatmentCalculationResultsPerPlantRecord.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return ChemicalTreatmentCalculationResultsPerPlantRecordSerializer(
            children, many=True
        ).data

    def get_per_herbicide_calculations(self, obj):
        children = (
            ChemicalTreatmentCalculationResultsPerPlantHerbicideRecord.objects.filter(
                activity_data_record=obj.activity_data_record
            )
        )
        return ChemicalTreatmentCalculationResultsPerPlantHerbicideRecordSerializer(
            children, many=True
        ).data

    class Meta:
        model = ChemicalTreatmentCalculationResultsRecord

        fields = [
            "calculation_type",
            "area_treated_sqm",
            "percent_area_covered",
            "amount_of_undiluted_herbicide_used_liters",
            "dilution",
            "per_plant_calculations",
            "per_herbicide_calculations",
        ]


class ChemicalTreatmentTankMixHerbicideSerializer(serializers.ModelSerializer):
    liquid_herbicide = LiquidHerbicideCodeSerializer()
    granular_herbicide = GranularHerbicideCodeSerializer()

    class Meta:
        model = ChemicalTreatmentTankMixHerbicide
        fields = [
            "index",
            "herbicide_type",
            "product_application_rate",
            "product_application_rate_calculated",
            "liquid_herbicide",
            "granular_herbicide",
        ]


class ChemicalTreatmentTankMixSerializer(serializers.ModelSerializer):
    herbicides = serializers.SerializerMethodField()

    def get_herbicides(self, obj):
        children = ChemicalTreatmentTankMixHerbicide.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return ChemicalTreatmentTankMixHerbicideSerializer(children, many=True).data

    class Meta:
        model = ChemicalTreatmentTankMix
        fields = [
            "calculation_type",
            "delivery_rate_of_mix",
            "amount_of_mix",
            "herbicides",
        ]


class ChemicalTreatmentDetailsSerializer(serializers.ModelSerializer):
    chemical_application_method = HerbicideApplicationMethodCodeSerializer()

    herbicides = serializers.SerializerMethodField()
    tank_mix_details = serializers.SerializerMethodField()
    terrestrial_invasive_plants = serializers.SerializerMethodField()
    aquatic_invasive_plants = serializers.SerializerMethodField()
    calculation_result = serializers.SerializerMethodField()

    def get_calculation_result(self, obj):
        children = ChemicalTreatmentCalculationResultsRecord.objects.filter(
            activity_data_record=obj.activity_data_record
        ).first()

        return (
            ChemicalTreatmentCalculationResultsRecordSerializer(children).data
            if children is not None
            else None
        )

    def get_herbicides(self, obj):
        children = Herbicide.objects.filter(
            activity_data_record=obj.activity_data_record
        )
        return HerbicideSerializer(children, many=True).data

    def get_terrestrial_invasive_plants(self, obj):
        children = ChemicalTreatmentTerrestrialInvasivePlantRecord.objects.filter(
            activity_data_record=obj.activity_data_record
        )

        return ChemicalTreatmentTerrestrialInvasivePlantRecordSerializer(
            children, many=True
        ).data

    def get_aquatic_invasive_plants(self, obj):
        children = ChemicalTreatmentAquaticInvasivePlantRecord.objects.filter(
            activity_data_record=obj.activity_data_record
        )

        return ChemicalTreatmentAquaticInvasivePlantRecordSerializer(
            children, many=True
        ).data

    def get_tank_mix_details(self, obj):
        children = ChemicalTreatmentTankMix.objects.filter(
            activity_data_record=obj.activity_data_record
        ).first()

        return (
            ChemicalTreatmentTankMixSerializer(children).data
            if children is not None
            else None
        )

    class Meta:
        model = ChemicalTreatmentDetails
        fields = (
            "chemical_application_method",
            "skip_application_rate_validation",
            "tank_mix",
            "tank_mix_details",
            "herbicides",
            "calculation_result",
            "terrestrial_invasive_plants",
            "aquatic_invasive_plants",
            "legacy_object_had_error_flag_set",
        )


class ChemicalTreatmentContextSerializer(serializers.ModelSerializer):
    application_start_time = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")

    class Meta:
        model = ChemicalTreatmentContext
        fields = (
            "pesticide_use_permit",
            "pest_management_plan",
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
