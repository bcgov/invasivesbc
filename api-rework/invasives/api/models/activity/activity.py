import datetime
import uuid

from django.core.exceptions import ValidationError
from django.db import models, transaction

from api.models.activity.activity_subtypes import ActivitySubtypes
from api.models.enums.activity_type import ActivityType
from api.models.enums.form_status import FormStatus
from api.models.mixins.batch import BatchInformation
from api.models.mixins.geometry import Geometry
from api.models.mixins.platform import Platform
from api.models.mixins.regional_detail import ComputedLocationFields

UUID_SUBSTRING_LENGTH = 8


class ActivityManager(models.Manager):
    def get_queryset(self):
        """Add global rule to filter out any deleted records from the frontend"""
        return super().get_queryset().exclude(form_status=FormStatus.Deleted)


class Activity(
    ComputedLocationFields, Geometry, BatchInformation, Platform, models.Model
):
    """
    Base Model for all form types.
    consumed by:
      - All IBC Activities
    """

    objects = ActivityManager()

    # Bypass filter if needed for cleanup tasks.
    all_objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    short_id = models.CharField(
        max_length=16, db_comment="User Readable formatted ID", editable=False
    )
    type = models.CharField(choices=ActivityType, db_index=True)
    subtype = models.CharField(
        choices=[(member.name, member.name) for member in ActivitySubtypes]
    )

    date = models.DateField(db_index=True)
    created_by = models.CharField(max_length=64, db_index=True)
    form_status = models.CharField(
        max_length=16, choices=FormStatus, default=FormStatus.Draft, db_index=True
    )
    access_description = models.TextField(
        max_length=16384,
        db_comment="User directions to access location",
        blank=True,
        null=True,
    )
    comment = models.TextField(max_length=16384, blank=True, null=True)
    created_timestamp = models.DateTimeField(auto_now_add=True)
    received_timestamp = models.DateTimeField(auto_now_add=True, editable=False)

    linked_activities = models.ManyToManyField(
        "api.Activity", db_table='"activity"."linked_activities"'
    )

    migration_remarks = models.TextField(max_length=16384, blank=True, null=True)

    @property
    def invasive_plants(self):

        # local import to avoid circular import. clean this up?
        from api.models.activity import (
            TerrestrialPlantObservationEntries,
            AquaticPlantObservationEntry,
            ChemicalTreatmentAquaticInvasivePlantRecord,
            ChemicalTreatmentTerrestrialInvasivePlantRecord,
            AquaticPlantMechanicalTreatmentEntry,
            TerrestrialPlantMechanicalTreatmentEntry,
            TerrestrialBiocontrolDispersalMonitoringEntry,
            TerrestrialBiocontrolReleaseEntry,
            TerrestrialBiocontrolCollectionEntry,
            TerrestrialTreatmentMonitoringEntry,
            AquaticTreatmentMonitoringEntry,
        )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Observation_Plant_Terrestrial
        ):
            return (
                TerrestrialPlantObservationEntries.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Observation_Plant_Aquatic:
            return (
                AquaticPlantObservationEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Treatment_Chemical_Plant_Aquatic
        ):
            return (
                ChemicalTreatmentAquaticInvasivePlantRecord.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial
        ):
            return (
                ChemicalTreatmentTerrestrialInvasivePlantRecord.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic
        ):
            return (
                AquaticPlantMechanicalTreatmentEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial
        ):
            return (
                TerrestrialPlantMechanicalTreatmentEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial
        ):
            return (
                TerrestrialBiocontrolDispersalMonitoringEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial
        ):
            return (
                TerrestrialBiocontrolReleaseEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if ActivitySubtypes[self.subtype] in [
            ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic,
            ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic,
        ]:

            terrestrial = (
                TerrestrialTreatmentMonitoringEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .values_list("invasive_plant__full", flat=True)
            )
            aquatic = (
                AquaticTreatmentMonitoringEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .values_list("invasive_plant__full", flat=True)
            )
            return terrestrial.union(aquatic).order_by("invasive_plant__full")

        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Biocontrol_Collection:
            return (
                TerrestrialBiocontrolCollectionEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Biocontrol_Release:
            return (
                TerrestrialBiocontrolReleaseEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        return []

    @property
    def species_treated_full(self):

        # differs from invasive_plants only by omission of Observations. verify this is correct behaviour

        # local import to avoid circular import. clean this up?
        from api.models.activity import (
            ChemicalTreatmentAquaticInvasivePlantRecord,
            ChemicalTreatmentTerrestrialInvasivePlantRecord,
            AquaticPlantMechanicalTreatmentEntry,
            TerrestrialPlantMechanicalTreatmentEntry,
            TerrestrialBiocontrolDispersalMonitoringEntry,
            TerrestrialBiocontrolReleaseEntry,
            TerrestrialBiocontrolCollectionEntry,
            TerrestrialTreatmentMonitoringEntry,
            AquaticTreatmentMonitoringEntry,
        )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Treatment_Chemical_Plant_Aquatic
        ):
            return (
                ChemicalTreatmentAquaticInvasivePlantRecord.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial
        ):
            return (
                ChemicalTreatmentTerrestrialInvasivePlantRecord.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic
        ):
            return (
                AquaticPlantMechanicalTreatmentEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial
        ):
            return (
                TerrestrialPlantMechanicalTreatmentEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial
        ):
            return (
                TerrestrialBiocontrolDispersalMonitoringEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial
        ):
            return (
                TerrestrialBiocontrolDispersalMonitoringEntry.objects.filter(  # is this the right model? copied from other implementation
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if ActivitySubtypes[self.subtype] in [
            ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic,
            ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic,
        ]:

            terrestrial = (
                TerrestrialTreatmentMonitoringEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .values_list("invasive_plant__full", flat=True)
            )
            aquatic = (
                AquaticTreatmentMonitoringEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .values_list("invasive_plant__full", flat=True)
            )
            return terrestrial.union(aquatic).order_by("invasive_plant__full")

        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Biocontrol_Collection:
            return (
                TerrestrialBiocontrolCollectionEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Biocontrol_Release:
            return (
                TerrestrialBiocontrolReleaseEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        return []

    @property
    def species_negative_full(self):
        from api.models.activity import (
            TerrestrialPlantObservationEntries,
            AquaticPlantObservationEntry,
        )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Observation_Plant_Terrestrial
        ):
            return (
                TerrestrialPlantObservationEntries.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .filter(observation_type="Negative")
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Observation_Plant_Aquatic:
            return (
                AquaticPlantObservationEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .filter(observation_type="Negative")
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        return []

    @property
    def species_positive_full(self):
        from api.models.activity import (
            TerrestrialPlantObservationEntries,
            AquaticPlantObservationEntry,
        )

        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Observation_Plant_Terrestrial
        ):
            return (
                TerrestrialPlantObservationEntries.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .filter(observation_type="Positive")
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Observation_Plant_Aquatic:
            return (
                AquaticPlantObservationEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .filter(observation_type="Positive")
                .distinct()
                .order_by("invasive_plant__full")
                .values_list("invasive_plant__full", flat=True)
            )

        return []

    @property
    def biocontrol_full(self):
        from api.models.activity import (
            TerrestrialBiocontrolDispersalMonitoringEntry,
            TerrestrialBiocontrolReleaseEntry,
            TerrestrialBiocontrolCollectionEntry,
        )

        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Biocontrol_Collection:
            return (
                TerrestrialBiocontrolCollectionEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .values_list("biological_agent__full", flat=True)
            )
        if ActivitySubtypes[self.subtype] == ActivitySubtypes.Biocontrol_Release:
            return (
                TerrestrialBiocontrolReleaseEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .values_list("biocontrol_agent__full", flat=True)
            )
        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial
        ):
            return (
                TerrestrialBiocontrolDispersalMonitoringEntry.objects.filter(
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .values_list("biocontrol_agent__full", flat=True)
            )
        if (
            ActivitySubtypes[self.subtype]
            == ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial
        ):
            return (
                TerrestrialBiocontrolDispersalMonitoringEntry.objects.filter(  # is this the right model? copied from other implementation
                    activity_data_record__activity_id=self.id
                )
                .distinct()
                .values_list("biocontrol_agent__full", flat=True)
            )

        return []

    class Meta:
        db_table = '"activity"."activity"'
        db_table_comment = (
            "Base fields for an activity. All records contain this information"
        )
        ordering = ["date", "received_timestamp"]
        indexes = [
            models.Index(
                fields=["type", "date"],
                name="activity_basic_date_type_idx",
            ),
            models.Index(
                fields=["subtype", "date"],
                name="activity_basic_date_sub_idx",
            ),
        ]

    def __str__(self):
        return self.short_id

    def clean(self):
        super().clean()
        for other in self.linked_activities.all():
            if other.id == self.id:
                raise ValidationError(
                    {"linked_activities": "activity cannot link to itself"}
                )

    def save(self, *args, **kwargs):
        """
        For new records, Mutate the activity ID into the ShortID For a record
        """
        if kwargs.get("update_fields"):
            # Only update fields, nothing extra needed
            return super().save(*args, **kwargs)

        if not self.short_id:
            subtype = ActivitySubtypes[self.subtype].short_id_format
            uuid_substr = str(self.id)[:UUID_SUBSTRING_LENGTH].upper()
            year = datetime.datetime.now().strftime("%y")
            self.short_id = f"{year}{subtype}{uuid_substr}"

        super().save(*args, **kwargs)

        if self.form_status == "Submitted" and not self.computed_fields_generated:
            from api.tasks import generate_computed_activity_fields

            # Start populating generated fields, send task to celery worker for pickup
            transaction.on_commit(
                lambda: generate_computed_activity_fields.delay(self.id)
            )


class ActivityDataRecord(models.Model):
    """
    Associate form data with an activity.
    This indirection is preferred because it clarifies cases where a repeated record itself contains sub-records
     (for example, some of the biocontrol types have repeated sub-records).
    """

    id = models.BigAutoField(primary_key=True)

    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
    )

    class Meta:
        db_table = '"activity"."data_record"'
        db_table_comment = "Represents a unit of form data associated with an activity (such as a participant or observation)."


class UnrepeatedFormData(models.Model):
    """
    For form data which can occur at most once per activity (eg the list of participants)

    @todo No actual checks are done at this point to confirm uniqueness of (subclass-name, activity) tuple uniqueness
    """

    activity_data_record = models.ForeignKey(
        ActivityDataRecord,
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True


class RepeatedFormData(models.Model):
    """
    For form data which can occur multiple times per activity (eg plant observation)
    """

    activity_data_record = models.ForeignKey(
        ActivityDataRecord,
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True
