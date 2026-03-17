from rest_framework import serializers
from api.models.activity import Activity


class LinkedRecordQuerySerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    full = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ["full", "label"]

    def get_full(self, obj: Activity):
        return obj.id

    def get_label(self, obj: Activity):
        return f"{obj.short_id} | {obj.date} | {obj.created_by}"
