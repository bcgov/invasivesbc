from rest_framework import serializers
from api.models.activity import Employer, DraftEmployer


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ["employer"]


class EmployerSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Employer


class DraftEmployerSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftEmployer
