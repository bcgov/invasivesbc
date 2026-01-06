from typing import Iterable

from rest_framework import serializers

from api.models import BaseCode


class CodeSerializer(serializers.BaseSerializer):
    def to_representation(self, items: Iterable[BaseCode]):
        return map(
            lambda instance: {
                "table": instance.__class__.__name__,
                "code": instance.code,
                "full_name": instance.full,
                "sort_order": instance.code_sort_order,
            },
            items,
        )
