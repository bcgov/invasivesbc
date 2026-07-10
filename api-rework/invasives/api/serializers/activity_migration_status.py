from rest_framework import serializers

from api.models.activity import Activity
from api.models.migrator import MigrationError
from api.models.migrator.activity_migration_status import ActivityMigrationStatus


class ActivityMigrationErrorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MigrationError
        fields = (
            "reason",
            "extended_status",
        )


class ActivityMigrationStatusSerializer(serializers.ModelSerializer):
    detail = ActivityMigrationErrorSerializer(source="migration_error_set", many=True)

    remarks = serializers.SerializerMethodField()

    def get_remarks(self, obj):
        found = Activity.objects.filter(id=obj.activity_id).first()
        if not found:
            return None
        return found.migration_remarks

    class Meta:
        model = ActivityMigrationStatus
        fields = ("activity_id", "timestamp", "success", "detail", "remarks")
