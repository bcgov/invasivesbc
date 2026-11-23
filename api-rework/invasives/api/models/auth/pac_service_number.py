from django.db import models

from api.models.mixins.temporal_association import NonExclusiveTemporalAssociation


class PACServiceNumber(NonExclusiveTemporalAssociation):
    """
    Represents a temporal association between a User and a Pesticide
    Applicator Certificate (PAC) service number. A user may hold multiple
    concurrently valid PAC numbers.
    """

    id = models.BigAutoField(primary_key=True)
    number = models.CharField(
        max_length=64,
        unique=False,
        db_comment="PAC (Pesticide Applicator Certificate) service number",
    )

    class Meta:
        db_table = '"authentication"."pac_service_number"'

    def __str__(self):
        return self.number
