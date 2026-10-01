from django.db import models
from api.models.auth import User
from . import Team


class TeamMember(models.Model):
    id = models.BigAutoField(primary_key=True)
    team = models.ForeignKey(
        Team, on_delete=models.PROTECT, db_comment="Team that member belongs to"
    )
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    join_date = models.DateField(
        auto_now_add=True,
        db_comment="Date user joined the team. Edit permissions begin here.",
    )
    leave_date = models.DateField(
        null=True,
        blank=True,
        db_comment="Date user left the team, Edit permissions end here.",
    )

    class Meta:
        db_table = '"teams"."member"'

    def __str__(self):
        user = self.user.display_name
        team = self.team.name

        return f"{team}: {user}"
