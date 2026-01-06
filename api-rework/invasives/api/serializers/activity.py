from rest_framework import serializers

from api.models import ActivityBasic


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityBasic
        fields = "__all__"
