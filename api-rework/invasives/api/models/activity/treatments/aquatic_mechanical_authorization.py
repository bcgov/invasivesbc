from django.db import models
from api.models.activity import UnrepeatedFormData


class AquaticMechanicalAuthorization(UnrepeatedFormData):
    authorization_information = models.CharField(
        null=True,
        blank=True,
        db_comment="description of authorization permit for in-stream work",
    )

    class Meta:
        db_table = '"activity"."mechanical_authorization_pa"'
