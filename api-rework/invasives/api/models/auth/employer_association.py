from api.models.codes import EmployerCode
from django.db import models

from api.models.mixins.temporal_association import NonExclusiveTemporalAssociation


class EmployerAssociation(NonExclusiveTemporalAssociation):
    """
    Temporal, many-to-many-style binding between a User and an EmployerCode.
    Uses NonExclusiveTemporalAssociation: a user may have multiple
    concurrently valid employer associations (e.g. secondary/contract
    employers).
    """

    id = models.BigAutoField(primary_key=True)
    employer = models.ForeignKey(
        EmployerCode,
        on_delete=models.RESTRICT,
        db_comment="Employer code association",
    )

    is_primary = models.BooleanField(
        default=False,
        db_comment="True if this should be considered the 'primary' employer for this user",
    )

    class Meta:
        db_table = '"authentication"."employer_to_user"'

    def __str__(self):
        return f"{self.user}: {self.employer} ({self.effective} - {self.expires})"
