from rest_framework import serializers

from api.models.activity import (
    WellEntry,
    DraftWellEntry,
    ChemicalTreatmentContext as ChemicalFormContext,
    DraftChemicalTreatmentContext as DraftChemicalFormContext,
    ChemTreatmentContext,
    DraftChemTreatmentContext,
)
from api.serializers.common import (
    NearestWellSerializer,
    ChemicalTreatmentFormContextSerializer,
    DraftChemicalTreatmentFormContextSerializer,
    DraftNearestWellSerializer,
    DraftChemicalTreatmentContextAquaticSerializer,
    ChemicalTreatmentContextAquaticSerializer,
)


class BaseSerializer(serializers.Serializer):
    context = serializers.SerializerMethodField()
    treatment_context = serializers.SerializerMethodField()
    well_entries = serializers.SerializerMethodField()

    class Meta:
        abstract = True


class AquaticChemicalTreatmentSerializer(BaseSerializer):
    def get_context(self, obj):
        children = ChemicalFormContext.objects.filter(
            activity_data_record__activity_id=obj.pk
        ).first()
        return ChemicalTreatmentFormContextSerializer(children).data

    def get_treatment_context(self, obj):
        children = ChemTreatmentContext.objects.filter(
            activity_data_record__activity_id=obj.pk
        ).first()
        return ChemicalTreatmentContextAquaticSerializer(
            children, context=self.context
        ).data

    def get_well_entries(self, obj):
        children = WellEntry.objects.filter(activity_data_record__activity_id=obj.id)
        return NearestWellSerializer(children, many=True).data if children else []


class DraftAquaticChemicalTreatmentSerializer(BaseSerializer):

    def get_context(self, obj):
        children = DraftChemicalFormContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftChemicalTreatmentFormContextSerializer(
                children, context=self.context
            ).data
            if children
            else None
        )

    def get_treatment_context(self, obj):
        children = DraftChemTreatmentContext.objects.filter(
            activity_data_record__activity_id=obj.id
        ).first()
        return (
            DraftChemicalTreatmentContextAquaticSerializer(
                children, context=self.context
            ).data
            if children
            else {}
        )

    def get_well_entries(self, obj):
        children = DraftWellEntry.objects.filter(
            activity_data_record__activity_id=obj.id
        )
        return (
            DraftNearestWellSerializer(children, many=True, context=self.context).data
            if children
            else None
        )
