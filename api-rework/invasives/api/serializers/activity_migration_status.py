from rest_framework import serializers

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

    # def get_detail(self, obj):
    #     return MigrationError.objects.filter(migration_status__id=obj.id)

    class Meta:
        model = ActivityMigrationStatus
        fields = (
            "activity_id",
            "timestamp",
            "success",
            "detail",
        )
