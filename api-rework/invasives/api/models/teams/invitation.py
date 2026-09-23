from django.db import models
from api.models.auth import User
from . import Team, InviteStatus
from django.utils import timezone


class TeamInvitation(models.Model):
    id = models.BigAutoField(primary_key=True)
    recipient = models.ForeignKey(User, on_delete=models.PROTECT)
    team = models.ForeignKey(Team, on_delete=models.PROTECT)
    date_stamp = models.DateTimeField(default=timezone.now)
    status = models.CharField(choices=InviteStatus)

    class Meta:
        db_table = '"teams"."invitations"'
        db_table_comment = "Invitations to join a given a team."

    def __str__(self):
        team = self.team.name
        recipient = self.recipient.display_name
        status = self.status
        return f"{team}: {recipient} | {status}"
