from rest_framework import serializers
from api.models.teams import TeamMember


class UserTeamsRowSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source="team.name", read_only=True)
    team_founder = serializers.CharField(source="team.founder.display_name")
    team_id = serializers.BigIntegerField(source="team.id")

    class Meta:
        model = TeamMember
        fields = ("team_founder", "team_name", "join_date", "team_id")
