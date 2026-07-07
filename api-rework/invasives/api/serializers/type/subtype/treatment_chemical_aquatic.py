from rest_framework import serializers

from api.models.activity import (
    WellEntry,
    ChemicalTreatmentContext,
    ChemicalTreatmentDetails,
)
from api.serializers.common import (
    NearestWellSerializer,
    ChemicalTreatmentContextSerializer,
)
from api.serializers.common.chemical_treatment_information import (
    ChemicalTreatmentDetailsSerializer,
)


class AquaticChemicalTreatmentSerializer(serializers.Serializer):
    context = serializers.SerializerMethodField()
    well_entries = serializers.SerializerMethodField()
    detail = serializers.SerializerMethodField()

    def get_context(self, obj):
        children = ChemicalTreatmentContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            ChemicalTreatmentContextSerializer(children).data
            if children is not None
            else None
        )

    def get_detail(self, obj):
        children = ChemicalTreatmentDetails.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            ChemicalTreatmentDetailsSerializer(children).data
            if children is not None
            else None
        )

    def get_well_entries(self, obj):
        children = WellEntry.objects.filter(activity_data_record__activity_id=obj.id)
        return NearestWellSerializer(children, many=True).data
