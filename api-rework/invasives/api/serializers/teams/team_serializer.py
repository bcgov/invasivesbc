from rest_framework import serializers
from api.models.teams import Team, TeamMember


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
