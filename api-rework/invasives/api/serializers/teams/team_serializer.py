from rest_framework import serializers
from api.models.teams import Team, TeamMember, TeamInvitation
from api.serializers.teams import UserTeamInvitationSerializer


class TeamMembersSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.display_name")

    class Meta:
        model = TeamMember
        fields = ("join_date", "leave_date", "name")


class SingleTeamSerializer(serializers.ModelSerializer):
    founder = serializers.CharField(source="founder.display_name")
    members = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = (
            "founder",
            "name",
            "founding_date",
            "id",
            "members",
        )

    def get_members(self, obj):
        members = TeamMember.objects.filter(team=obj)
        return TeamMembersSerializer(members, many=True).data


class ElevatedSingleTeamSerializer(SingleTeamSerializer):
    invitations = serializers.SerializerMethodField()

    class Meta(SingleTeamSerializer.Meta):
        fields = SingleTeamSerializer.Meta.fields + ("invitations")

    def get_invitations(self, obj):
        invites = TeamInvitation.objects.filter(team=obj.id).order_by("date_stamp")
        return UserTeamInvitationSerializer(invites, many=True).data
