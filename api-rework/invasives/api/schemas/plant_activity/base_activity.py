from django.db import transaction
from typing import Dict, Any, List
from api.models.activity.activity import Activity
from api.models.activity import (
    ActivityDataRecord,
    Participant,
    Employer,
    FundingAgency,
    ProjectCode,
    Jurisdiction,
    UploadedImage,
)

# Common Sub-Models
MODEL_MAPPING = {
    "participants": Participant,
    "funding_agencies": FundingAgency,
    "employer": Employer,
    "jurisdictions": Jurisdiction,
    "media": UploadedImage,
    "projects": ProjectCode,
}


class BaseActivityProcessor:
    @classmethod
    def process(cls, payload: Dict[str, Any], instance: Activity = None) -> Activity:
        """Determines pipeline path inside an atomic transaction."""
        with transaction.atomic():
            subtype_data = payload.pop("subtype_data", {})
            linked_ids = payload.pop("linked_activities", [])

            if instance:  # Update
                activity = cls.update_activity(instance, payload, linked_ids)
            else:  # Create
                activity = cls.create_activity(payload, linked_ids)

            # Route unique model properties to subclass
            cls.save_subtype_records(subtype_data, activity)
            return activity

    @classmethod
    def create_activity(
        cls, payload: Dict[str, Any], linked_ids: List[int]
    ) -> Activity:
        # Remove nested fields not directly attributed to Activity object
        nested_data = {
            key: payload.pop(key, []) for key in MODEL_MAPPING if key in payload
        }

        # Instantiate parent
        activity = Activity.objects.create(**payload)
        if linked_ids:
            activity.linked_activities.set(linked_ids)

        cls._bulk_create_nested_models(activity, nested_data)
        return activity

    @classmethod
    def update_activity(
        cls, instance: Activity, payload: Dict[str, Any], linked_ids: List[int]
    ) -> Activity:
        ###
        # TODO: Add some auditing logic here. (changelog)
        ###
        nested_data = {
            key: payload.pop(key, []) for key in MODEL_MAPPING if key in payload
        }
        # Update Top level Activity Object with new information.
        for field, value in payload.items():
            setattr(instance, field, value)
        instance.save()

        instance.linked_activities.set(linked_ids)
        # Erase all nested items for an activity before recreating.
        ActivityDataRecord.objects.filter(activity=instance).delete()
        cls._bulk_create_nested_models(instance, nested_data)
        return instance

    @classmethod
    def _bulk_create_nested_models(cls, parent: Activity, nested_data: Dict[str, Any]):
        """
        Iterate through nested fields and create the related model.
        """
        adr = ActivityDataRecord.objects.create(activity=parent)
        for key, model_cls in MODEL_MAPPING.items():
            entries = nested_data.get(key, [])
            if entries:
                model_cls.objects.bulk_create(
                    model_cls(activity_data_record=adr, **values) for values in entries
                )

    @classmethod
    def save_subtype_records(cls, subtype_data: Dict[str, Any], parent: Activity):
        raise NotImplementedError("Subclasses must implement `save_subtype_records`.")
