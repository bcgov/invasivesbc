from rest_framework import serializers
from api.models.teams import TeamInvitation


class UserTeamInvitationSerializer(serializers.ModelSerializer):
    founder = serializers.CharField(source="team.founder.display_name")
    name = serializers.CharField(source="team.name")
    invitee = serializers.CharField(source="recipient.display_name")

    founding_date = serializers.CharField(source="team.founding_date")

    class Meta:
        model = TeamInvitation
        fields = (
            "founder",
            "name",
            "founding_date",
            "date_stamp",
            "id",
            "invitee",
            "status",
        )
