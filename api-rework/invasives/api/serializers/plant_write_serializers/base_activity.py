import json

from rest_framework import serializers

from django.db.models import Model
from api.models.activity import (
    ActivityDataRecord,
    Employer,
    FundingAgency,
    Jurisdiction,
    Participant,
    ProjectCode,
)
from django.contrib.gis.geos import GEOSGeometry
from api.models.activity.activity import Activity
from api.models.activity import UploadedImage
from api.serializers.activity import (
    ParticipantSerializer,
    EmployerSerializer,
    FundingAgencySerializer,
    ProjectCodeSerializer,
    JurisdictionSerializer,
    UploadedImageSerializer,
)


class ActivityWriteSerializer(serializers.ModelSerializer):
    subtype_data = serializers.JSONField()
    linked_activities = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Activity.objects.all(), required=False, allow_empty=True
    )
    media = UploadedImageSerializer(many=True, required=False)
    participants = ParticipantSerializer(many=True, required=False)
    employer = EmployerSerializer(many=True, required=True)
    funding_agencies = FundingAgencySerializer(many=True, required=True)
    projects = ProjectCodeSerializer(many=True, required=True)
    jurisdictions = JurisdictionSerializer(many=True, required=True)
    # Pydantic validation adds Z-indexes which get lost in translatio for being 0, so declare as JSON and convert.
    shape = serializers.JSONField(required=False)
    id = serializers.UUIDField(required=False)

    class Meta:
        model = Activity
        fields = [
            # Top Level Fields
            "id",
            "short_id",
            "type",
            "subtype",
            "date",
            "created_by",
            "form_status",
            "access_description",
            "comment",
            "linked_activities",
            "migration_remarks",
            "shape",
            "utm_easting",
            "utm_northing",
            "utm_zone",
            "latitude",
            "longitude",
            "location_description",
            "area_m",
            "batch_id",
            "batch_row_id",
            "shape_radius",
            "comment",
            # 1:M Relations
            "participants",
            "employer",
            "funding_agencies",
            "projects",
            "jurisdictions",
            "media",
            # Lump all of the subtype data to one generic blob.
            "subtype_data",
        ]
        extra_kwargs = {
            "short_id": {"read_only": True},
        }

    def validate_shape(self, value):
        geometry = value.get("geometry", value)
        return GEOSGeometry(json.dumps(geometry))

    def to_internal_value(self, data):
        linked = data.get("linked_activities")

        if linked and isinstance(linked, list):
            cleaned = []
            for item in linked:
                if isinstance(item, dict) and "full" in item:
                    cleaned.append(item["full"])
                else:
                    cleaned.append(item)
            data["linked_activities"] = cleaned

        return super().to_internal_value(data)

    def _bulk_create_nested_models(self, parent: Activity, nested_models: dict):
        """
        Iterate through nested fields and create the related model.
        """
        adr = ActivityDataRecord.objects.create(activity=parent)
        for model, entries in nested_models.items():
            model.objects.bulk_create(
                model(activity_data_record=adr, **values) for values in entries
            )

    def _remove_nested_models(self, validated_data: dict) -> dict:
        """
        Removes models from the Serializers not belonging to the parent Activity but are common in all record types.
        """
        return {
            Participant: validated_data.pop("participants", []),
            FundingAgency: validated_data.pop("funding_agencies", []),
            Employer: validated_data.pop("employer", []),
            Jurisdiction: validated_data.pop("jurisdictions", []),
            UploadedImage: validated_data.pop("media", []),
            ProjectCode: validated_data.pop("projects", []),
        }

    def create(self, validated_data):
        # Remove nested fields not directly attributed to Activity object (else throws Error)
        subtype_data = validated_data.pop("subtype_data")
        linked = validated_data.pop("linked_activities", None)
        nested_models = self._remove_nested_models(validated_data)

        # Create Activity so we have parent reference
        instance = Activity.objects.create(**validated_data)
        instance.linked_activities.set(linked)

        self._bulk_create_nested_models(parent=instance, nested_models=nested_models)
        # Start subtype specific creation methods.
        self.save_subtype_records(subtype_data=subtype_data, parent=instance)
        return instance

    def update(self, instance, validated_data):
        subtype_data = validated_data.pop("subtype_data")
        nested_models = self._remove_nested_models(validated_data)
        ###
        # TODO: Add some auditing logic here. (changelog)
        ###

        # Update Top level Activity Object with new information.
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        linked = validated_data.pop("linked_activities", None)
        instance.linked_activities.set(linked)

        # Erase all nested items for an activity before recreating.
        ActivityDataRecord.objects.filter(activity=instance).delete()
        self._bulk_create_nested_models(parent=instance, nested_models=nested_models)

        # Start subtype specific creation methods.
        self.save_subtype_records(subtype_data=subtype_data, parent=instance)
        return instance

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        """Handles the specific parsing for models under a record subtype."""
        raise NotImplementedError("Subclasses must implement `save_subtype_records`.")
