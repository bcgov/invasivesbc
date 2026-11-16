import json

from rest_framework import serializers

from api.models.iapp import (
    IAPPBiologicalDispersal,
    IAPPBiologicalMonitoring,
    IAPPBiologicalTreatment,
    IAPPChemicalMonitoring,
    IAPPChemicalTreatment,
    IAPPImportedImage,
    IAPPMechanicalMonitoring,
    IAPPMechanicalTreatment,
    IAPPSite,
    IAPPSiteSelection,
    IAPPSurvey,
)

# Record type name -> related name of the child records that define it.
IAPP_RECORD_TYPES = {
    "biological_dispersal": "biological_dispersals",
    "biological_monitoring": "biological_monitorings",
    "biological_treatment": "biological_treatments",
    "chemical_monitoring": "chemical_monitorings",
    "chemical_treatment": "chemical_treatments",
    "mechanical_monitoring": "mechanical_monitorings",
    "mechanical_treatment": "mechanical_treatments",
}
IAPP_UNKNOWN_RECORD_TYPE = "Observation"


def _join(values) -> str:
    # None becomes a placeholder entry so the parallel fields stay aligned.
    return ", ".join("Unknown" if v is None else str(v) for v in values)


def record_type_annotation(record_type: str) -> str:
    return f"has_{record_type}"


class GeoJSONGeometryField(serializers.Field):
    """Read-only GeoJSON representation of a GEOS geometry."""

    def __init__(self, **kwargs):
        kwargs["read_only"] = True
        super().__init__(**kwargs)

    def to_representation(self, value):
        return json.loads(value.geojson)


class IAPPSiteListSerializer(serializers.Serializer):
    """
    Shallow site summary. Expects a queryset annotated with `survey_dates`,
    `species_list`, `survey_types` (parallel arrays ordered newest survey first), `latitude`, `longitude` and one `has_<record type>` flag per record type (see IAPPViewSet).
    """

    site_id = serializers.IntegerField(read_only=True)
    survey_date = serializers.SerializerMethodField()
    species = serializers.SerializerMethodField()
    survey_type = serializers.SerializerMethodField()
    record_type = serializers.SerializerMethodField()
    latitude = serializers.DecimalField(
        max_digits=7, decimal_places=5, read_only=True, allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=8, decimal_places=5, read_only=True, allow_null=True
    )

    def get_survey_date(self, obj) -> str:
        return _join(d.isoformat() if d else None for d in obj.survey_dates or [])

    def get_species(self, obj) -> str:
        return _join(obj.species_list or [])

    def get_survey_type(self, obj) -> str:
        return _join(obj.survey_types or [])

    def get_record_type(self, obj) -> str:
        present = sorted(
            name
            for name in IAPP_RECORD_TYPES
            if getattr(obj, record_type_annotation(name))
        )
        return ", ".join(present) or IAPP_UNKNOWN_RECORD_TYPE


def _child_serializer(model):
    meta = type("Meta", (), {"model": model, "fields": "__all__"})
    return type(
        f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": meta}
    )


IAPPSiteSelectionSerializer = _child_serializer(IAPPSiteSelection)
IAPPSurveySerializer = _child_serializer(IAPPSurvey)
IAPPChemicalTreatmentSerializer = _child_serializer(IAPPChemicalTreatment)
IAPPChemicalMonitoringSerializer = _child_serializer(IAPPChemicalMonitoring)
IAPPMechanicalTreatmentSerializer = _child_serializer(IAPPMechanicalTreatment)
IAPPMechanicalMonitoringSerializer = _child_serializer(IAPPMechanicalMonitoring)
IAPPBiologicalTreatmentSerializer = _child_serializer(IAPPBiologicalTreatment)
IAPPBiologicalMonitoringSerializer = _child_serializer(IAPPBiologicalMonitoring)
IAPPBiologicalDispersalSerializer = _child_serializer(IAPPBiologicalDispersal)
IAPPImportedImageSerializer = _child_serializer(IAPPImportedImage)

IAPP_CHILD_SERIALIZERS = {
    "site_selections": IAPPSiteSelectionSerializer,
    "surveys": IAPPSurveySerializer,
    "chemical_treatments": IAPPChemicalTreatmentSerializer,
    "chemical_monitorings": IAPPChemicalMonitoringSerializer,
    "mechanical_treatments": IAPPMechanicalTreatmentSerializer,
    "mechanical_monitorings": IAPPMechanicalMonitoringSerializer,
    "biological_treatments": IAPPBiologicalTreatmentSerializer,
    "biological_monitorings": IAPPBiologicalMonitoringSerializer,
    "biological_dispersals": IAPPBiologicalDispersalSerializer,
    "images": IAPPImportedImageSerializer,
}


class IAPPSiteSerializer(serializers.ModelSerializer):
    """Deep, read-only site representation including all child records."""

    geometry = GeoJSONGeometryField(allow_null=True)

    class Meta:
        model = IAPPSite
        fields = ("site_id", "protected", "geometry", *IAPP_CHILD_SERIALIZERS)
        read_only_fields = fields


for _name, _serializer in IAPP_CHILD_SERIALIZERS.items():
    IAPPSiteSerializer._declared_fields[_name] = _serializer(many=True, read_only=True)
