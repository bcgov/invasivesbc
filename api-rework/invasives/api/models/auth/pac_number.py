from django.db import models

from api.models.mixins.temporal_association import NonExclusiveTemporalAssociation


class PACNumber(NonExclusiveTemporalAssociation):
    """
    Represents a temporal association between a User and a Pesticide
    Applicator Certificate (PAC) number. A user may hold multiple
    concurrently valid PAC numbers.
    """

    id = models.BigAutoField(primary_key=True)
    number = models.CharField(
        max_length=64,
        unique=False,
        db_comment="PAC (Pesticide Applicator Certificate) number",
    )

    class Meta:
        db_table = '"authentication"."pac_number"'

    def __str__(self):
        return self.number
