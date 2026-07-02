from rest_framework import serializers
from api.models.activity import ProjectCode, DraftProjectCode


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["description"]


class ProjectCodeSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = ProjectCode


class DraftProjectCodeSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = ProjectCode
