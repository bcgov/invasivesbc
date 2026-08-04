from rest_framework import serializers
from api.models.activity import Participant, DraftParticipant, ActivitySubtypes


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True
        fields = ("name", "pac_number")

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        try:
            if instance.activity_data_record.activity.subtype in [
                ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name,
                ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name,
            ]:
                return ret
        except Exception as e:
            pass
        return {"name": ret["name"]}


class ParticipantSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = Participant


class DraftParticipantSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = DraftParticipant
