from rest_framework import serializers
from api.models.teams import TeamInvitation


class UserTeamInvitationSerializer(serializers.ModelSerializer):
    founder = serializers.CharField(source="team.founder.display_name")
    name = serializers.CharField(source="team.name")
    invitee = serializers.CharField(source="recipient.display_name")
    agencies = serializers.SerializerMethodField()
    founding_date = serializers.CharField(source="team.founding_date")

    class Meta:
        model = TeamInvitation
        fields = (
            "founder",
            "name",
            "founding_date",
            "date_stamp",
            "id",
            "agencies",
            "invitee",
            "status",
        )

    def get_agencies(self, obj):
        return ", ".join([agency.full for agency in obj.team.agencies.all()])
