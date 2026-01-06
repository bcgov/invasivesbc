from rest_framework import serializers

from api.models import ActivityMigrationStatus


class ActivityMigrationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityMigrationStatus
        fields = "__all__"
