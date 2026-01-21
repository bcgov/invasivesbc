from rest_framework import serializers
from api.serializers.common import (
  NearestWellSerializer,
  ChemicalTreatmentInformationSerializer
)

class TerrestrialChemicalTreatmentSerializer(serializers.Serializer):
  chem_treatment = ChemicalTreatmentInformationSerializer(source="chemtreatment")
  well_information = NearestWellSerializer(source="nearestwell_set", many=True)
  chem_treatment_details = serializers.SerializerMethodField()

  def get_chem_treatment_details(self, obj):
    # TODO:
    return "NOT IMPLEMENTED"

  def to_representation(self, instance):
    ret = super().to_representation(instance)
    info_data = ret.pop("chem_treatment", None)
    if info_data and isinstance(info_data, dict):
      ret.update(info_data)
    return ret
