from rest_framework import serializers
from api.models.activity import Activity, DraftActivity


class BaseSerializer(serializers.ModelSerializer):
    has_migration_remarks = serializers.BooleanField(read_only=True)

    class Meta:
        abstract = True
        fields = ("id", "type", "subtype", "date", "has_migration_remarks")


class ActivityListSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = Activity


class DraftActivityListSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = DraftActivity
