from rest_framework import serializers
from api.models.activity import (
    AquaticTreatmentMonitoringEntry,
    TerrestrialTreatmentMonitoringEntry,
)


###
# MechanicalMonitoring Serializer
###
class BaseTreatmentMonitoringSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            "evidence_of_treatment",
            "treatment_pass",
            "comment",
            "invasive_plant",
            "monitoring_evidence_codes",
            "management_efficacy_rating",
            "treatment_efficacy_rating",
        )


class TerrestrialTreatmentMonitoringSerializer(BaseTreatmentMonitoringSerializer):

    class Meta(BaseTreatmentMonitoringSerializer.Meta):
        model = TerrestrialTreatmentMonitoringEntry


class AquaticMechanicalMonitoringSerializer(BaseTreatmentMonitoringSerializer):

    class Meta(BaseTreatmentMonitoringSerializer.Meta):
        model = AquaticTreatmentMonitoringEntry

    def to_representation(self, instance):
        """
        Modify invasive plant column to highlight aquatic to match forms expectations. Used to determine terrestrial/aquatic
        """
        ret = super().to_representation(instance)
        ipa = {"invasive_plant_aquatic": ret.pop("invasive_plant")}
        ret.update(ipa)
        return ret


class TreatmentMonitoringEntriesSerializer(serializers.Serializer):
    """Shared Between Mechanical and Chemical Treatments"""

    a_monitoring_information = AquaticMechanicalMonitoringSerializer(
        source="aquatictreatmentmonitoringentry_set", many=True, required=False
    )
    t_monitoring_information = TerrestrialTreatmentMonitoringSerializer(
        source="terrestrialtreatmentmonitoringentry_set",
        many=True,
        required=False,
    )

    def to_representation(self, instance):
        """
        One Monitoring Information Record can have both Terrestrial and Aquatic Monitoring entries.
        Each entry is XOR Terrestrial/Aquatic. This joins them into one final array.
        """
        ret = super().to_representation(instance)
        am = ret.pop("a_monitoring_information", [])
        tm = ret.pop("t_monitoring_information", [])
        ret.update({"entries": am + tm})
        return ret

    def to_internal_value(self, data):
        """Split incoming list into respective models, normalize aquatic plant key to consistent generic in DB"""
        items = data.get("entries", [])
        a_items = []
        t_items = []
        errors = {}

        for idx, item in enumerate(items):
            has_t = "invasive_plant" in item
            has_a = "invasive_plant_aquatic" in item
            if has_a == has_t:
                errors[idx] = {
                    "non_field_errors": (
                        "Exactly one of 'invasive_plant' or "
                        "'invasive_plant_aquatic' must be provided."
                    )
                }
            elif has_a:
                normalized = dict(item)
                normalized["invasive_plant"] = normalized.pop("invasive_plant_aquatic")
                serializer = AquaticMechanicalMonitoringSerializer(data=normalized)
                target = a_items
            elif has_t:
                serializer = TerrestrialTreatmentMonitoringSerializer(data=item)
                target = t_items

            if serializer.is_valid():
                target.append(serializer.validated_data)
            else:
                errors[idx] = serializer.errors

            if errors:
                raise serializers.ValidationError({"entries": errors})
        return {
            "aquatictreatmentmonitoringinformation_set": a_items,
            "terrestrialtreatmentmonitoringinformation_set": t_items,
        }
