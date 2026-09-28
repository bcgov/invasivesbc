from rest_framework import serializers
from api.models.auth import User


class SuggestedUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="display_name")
    code = serializers.CharField(source="subject")

    class Meta:
        model = User
        fields = ("code", "full_name")
