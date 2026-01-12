from rest_framework import serializers
from api.models.activity.observations import (
  TerrestrialPlantObservationDetail,
  TerrestrialVoucherSpecimen,
  TerrestrialPlantObservationInfo,
  TerrestrialObservationSpecificUse
)

class TerrestrialVoucherSpecimenSerializer(serializers.ModelSerializer):
  class Meta:
    model = TerrestrialVoucherSpecimen
    fields = (
      "invasive_plant",
      "voucher_sample_id",
      "date_collected",
      "date_verified",
      "herbarium",
      "accession_number",
      "completed_by_person",
      "completed_by_org",
      "utm_zone",
      "utm_easting",
      "utm_northing",
    )

class TerrestrialPlantObservationDetailSerializer(serializers.ModelSerializer):
  voucher_specimen = serializers.SerializerMethodField()
  class Meta:
    model = TerrestrialPlantObservationDetail
    fields = (
      "density",
      "distribution",
      "invasive_plant",
      "life_stage",
      "observation_type",
      "voucher_specimen"
    )

  def get_voucher_specimen(self, obj):
    """Search for Voucher Specimen matching the record"""
    activity_id = getattr(obj, "activity_id", None)
    invasive_plant = obj.invasive_plant

    if not activity_id or not invasive_plant:
      return None

    try:
      voucher_specimen = TerrestrialVoucherSpecimen.objects.get(activity_id=activity_id, invasive_plant=invasive_plant)
      return TerrestrialVoucherSpecimenSerializer(voucher_specimen).data
    except TerrestrialVoucherSpecimen.DoesNotExist:
      return None



class TerrestrialPlantObservationInfoSerializer(serializers.ModelSerializer):
  class Meta:
    model = TerrestrialPlantObservationInfo
    fields = (
      "research_observation",
      "visible_well_nearby",
      "aspect",
      "slope_percent",
      "soil_texture",
    )

class TerrestrialObservationSpecificUseSerializer(serializers.ModelSerializer):
  class Meta:
    model = TerrestrialObservationSpecificUse()
    fields = ["specific_use"]

  def to_representation(self, instance):
    ret = super().to_representation(instance)
    return ret["specific_use"]


class TerrestrialObservationSerializer(serializers.Serializer):
  suitable_for_biocontrol = serializers.CharField(source="suitableforbiocontrol.suitable_for_biocontrol")
  observation_details = TerrestrialPlantObservationDetailSerializer(source="terrestrialplantobservationdetail_set", many=True)
  observation_information = TerrestrialPlantObservationInfoSerializer(source="terrestrialplantobservationinfo")
  pretreatment_observation = serializers.CharField(source="pretreatmentobservation.pre_treatment_observation")
  specific_use = TerrestrialObservationSpecificUseSerializer(source="terrestrialobservationspecificuse_set", many=True)

  def to_representation(self, instance):
        ret = super().to_representation(instance)
        info_data = ret.pop('observation_information', None)

        if info_data and isinstance(info_data, dict):
            ret.update(info_data)
        return ret
