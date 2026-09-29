from rest_framework import serializers
from api.models.teams import Team, TeamMember, TeamInvitation
from api.serializers.teams import UserTeamInvitationSerializer


class TeamMembersSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.display_name")
    subject = serializers.CharField(source="user.subject")

    class Meta:
        model = TeamMember
        fields = ("join_date", "leave_date", "name", "subject")


class SingleTeamSerializer(serializers.ModelSerializer):
    founder = serializers.CharField(source="founder.display_name")
    members = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    agencies = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = (
            "can_edit",
            "agencies",
            "founder",
            "name",
            "founding_date",
            "id",
            "members",
            "description",
        )

    def get_members(self, obj):
        members = TeamMember.objects.filter(team=obj, leave_date=None)
        return TeamMembersSerializer(members, many=True).data

    def get_can_edit(self, _):
        return False

    def get_agencies(self, obj):
        return ", ".join([agency.full for agency in obj.agencies.all()])


class ElevatedSingleTeamSerializer(SingleTeamSerializer):
    invitations = serializers.SerializerMethodField()

    class Meta(SingleTeamSerializer.Meta):
        fields = SingleTeamSerializer.Meta.fields + ("invitations",)

    def get_members(self, obj):
        members = TeamMember.objects.filter(team=obj)
        return TeamMembersSerializer(members, many=True).data

    def get_invitations(self, obj):
        invites = TeamInvitation.objects.filter(team=obj.id).order_by("-date_stamp")
        return UserTeamInvitationSerializer(invites, many=True).data

    def get_can_edit(self, _):
        return True
