from rest_framework import serializers

from api.models import BaseCode


class CodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseCode
        fields = "__all__"
