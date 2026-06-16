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
        if value is None:
            return None
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

    def _create_from_list(
        self,
        model: type[Model],
        parent: Activity,
        entries: list[dict] | None,
    ):
        if not entries:
            return
        for e in entries:
            adr = ActivityDataRecord.objects.create(activity=parent)
            model.objects.create(activity_data_record=adr, **e)

    def _remove_extra_fields(self, validated_data: dict) -> dict:
        """Remove all the extra fields from the validated data, and return as own object for later parsing."""
        return {
            "linked_activities": {
                "entries": validated_data.pop("linked_activities", []),
                "model": None,
            },
            "participants": {
                "entries": validated_data.pop("participants", []),
                "model": Participant,
            },
            "funding_agencies": {
                "entries": validated_data.pop("funding_agencies", []),
                "model": FundingAgency,
            },
            "employers": {
                "entries": validated_data.pop("employer", []),
                "model": Employer,
            },
            "jurisdictions": {
                "entries": validated_data.pop("jurisdictions", []),
                "model": Jurisdiction,
            },
            "media": {
                "entries": validated_data.pop("media", []),
                "model": UploadedImage,
            },
            "projects": {
                "entries": validated_data.pop("projects", []),
                "model": ProjectCode,
            },
        }

    def create(self, validated_data):
        subtype_data = validated_data.pop("subtype_data")
        ef = self._remove_extra_fields(validated_data)
        instance = Activity.objects.create(**validated_data)
        linked = ef.pop("linked_activities")["entries"]
        if linked:
            instance.linked_activities.set(linked)
        for field in ef.values():
            self._create_from_list(
                model=field["model"], parent=instance, entries=field["entries"]
            )
        self.save_subtype_records(subtype_data=subtype_data, parent=instance)
        return instance

    def update(self, instance, validated_data):
        subtype_data = validated_data.pop("subtype_data")
        ef = self._remove_extra_fields(validated_data)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        for value in ef["media"]["entries"]:
            for key in value.values():
                print(bool(key))
        linked = ef.pop("linked_activities")["entries"]
        if linked:
            instance.linked_activities.set(linked)

        ActivityDataRecord.objects.filter(activity=instance).delete()

        for field in ef.values():
            self._create_from_list(
                model=field["model"], parent=instance, entries=field["entries"]
            )

        self.save_subtype_records(subtype_data=subtype_data, parent=instance)
        return instance

    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        raise NotImplementedError("Subclasses must implement `save_subtype_records`.")
