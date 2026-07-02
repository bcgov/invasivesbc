from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData


class ParticipantMixin(models.Model):
    name = models.CharField(max_length=64)
    pac_number = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        db_comment="Pesticide Application Number (if applicable)",
    )

    class Meta:
        abstract = True


class Participant(ParticipantMixin, RepeatedFormData):

    class Meta:
        db_table = '"activity"."participant"'
        db_table_comment = "A Participant is any individual who participated in an activity. They may not be an application user"
        ordering = ["name"]


class DraftParticipant(ParticipantMixin, DraftRepeatedFormData):
    name = models.CharField(max_length=64, blank=True, null=True)
    pac_number = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        db_comment="Pesticide Application Number (if applicable)",
    )

    class Meta:
        db_table = '"draft_activity"."participant"'
        db_table_comment = "A Participant is any individual who participated in an activity. They may not be an application user"
        ordering = ["name"]
