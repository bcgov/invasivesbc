from rest_framework import serializers
from api.models.activity import (
    InvasivePlantsOnSite,
    DraftInvasivePlantsOnSite,
)


class BaseSerializer(serializers.ModelSerializer):

    class Meta:
        abstract = True
        fields = ("invasive_plants_on_site",)


class InvasivePlantsOnSiteSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = InvasivePlantsOnSite


class DraftInvasivePlantsOnSiteSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = DraftInvasivePlantsOnSite
