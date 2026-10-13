from api.models.codes import FundingAgencyCode
from django.db import models

from api.models.mixins.temporal_association import NonExclusiveTemporalAssociation


class AgencyAssociation(NonExclusiveTemporalAssociation):
    """
    Temporal, many-to-many-style binding between a User and an FundingAgencyCode.
    Uses NonExclusiveTemporalAssociation: a user may have multiple
    concurrently valid agency associations.
    """

    id = models.BigAutoField(primary_key=True)
    agency = models.ForeignKey(
        FundingAgencyCode,
        on_delete=models.RESTRICT,
        db_comment="Funding Agency code association",
    )
    is_primary = models.BooleanField(
        default=False,
        db_comment="True if this should be considered the 'primary' funding agency for this user",
    )

    class Meta:
        db_table = '"authentication"."agency_to_user"'

    def __str__(self):
        return f"{self.user}: {self.agency} ({self.effective} - {self.expires})"
