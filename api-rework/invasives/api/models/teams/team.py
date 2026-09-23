from django.db import models
from api.models.auth import User


class Team(models.Model):
    id = models.BigAutoField(primary_key=True)
    founder = models.ForeignKey(User, on_delete=models.CASCADE)
    founding_date = models.DateField(
        auto_now_add=True,
        db_comment="Date team was created. Deterministic for editable record",
    )
    disbanded_date = models.DateField(
        null=True,
        blank=True,
        db_comment="Date team was disbanded by the creator",
    )
    name = models.CharField(
        max_length=64,
        db_comment="Display name for a team. What appears in the frontend",
    )
    agencies = models.ManyToManyField(
        "api.FundingAgencyCode",
        db_table='"teams"."team_agencies"',
    )

    class Meta:
        db_table = '"teams"."teams"'
        db_table_comment = (
            "Teams belonging to Data Managers for giving edit permission of cohorts"
        )

    def __str__(self):
        founder = self.founder.display_name
        name = self.name
        return f"{name}\nFounded by: {founder}"
