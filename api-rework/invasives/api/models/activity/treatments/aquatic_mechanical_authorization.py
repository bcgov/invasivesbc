from django.db import models
from api.models.activity import UnrepeatedFormData, DraftUnrepeatedFormData


class AquaticMechanicalAuthorizationMixin(models.Model):
    authorization_information = models.CharField(
        null=True,
        blank=True,
        db_comment="description of authorization permit for in-stream work",
    )

    class Meta:
        abstract = True


class AquaticMechanicalAuthorization(
    AquaticMechanicalAuthorizationMixin,
    UnrepeatedFormData,
):
    class Meta:
        db_table = '"activity"."mechanical_authorization_pa"'


class DraftAquaticMechanicalAuthorization(
    AquaticMechanicalAuthorizationMixin,
    DraftUnrepeatedFormData,
):
    class Meta:
        db_table = '"draft_activity"."mechanical_authorization_pa"'
