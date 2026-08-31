from rest_framework import serializers
from api.models.activity.activity import Activity, DraftActivity
from api.models.activity import (
    ActivitySubtypes,
)


class BaseSerializer(serializers.ModelSerializer):
    PATH_TO_PLANT_MAP = {}
    invasive_plant = serializers.SerializerMethodField()
    record_set_attr = None

    class Meta:
        abstract = True
        fields = ("invasive_plant",)

    def get_entry_destination(self, subtype):
        """
        Helper for quickly matching a records subtype to list of plant locations.
        """
        dest = self.PATH_TO_PLANT_MAP.get(subtype)
        if isinstance(dest, str):
            return [dest]
        return dest

    def _get_plant_entries(self, obj):
        destinations = self.get_entry_destination(obj.subtype)
        for record in self._get_records(obj):
            for destination in destinations:
                # Some draft items might be missing destination attributes
                if hasattr(record, destination):
                    yield from getattr(record, destination).all()

    def _get_records(self, obj):
        if not self.record_set_attr:
            return []
        return getattr(obj, self.record_set_attr).all()

    def get_invasive_plant(self, obj):
        plants = [
            e.invasive_plant.full
            for e in self._get_plant_entries(obj)
            if e.invasive_plant
        ]
        return ", ".join(filter(None, plants)) or None


class ActivityAllPlantSerializer(BaseSerializer):
    """
    Entry For Serializing Activities to a Recordset Row. Covers all Submission entries
    """

    # Dynamic property fields
    record_set_attr = "activitydatarecord_set"

    class Meta(BaseSerializer.Meta):
        model = Activity

    PATH_TO_PLANT_MAP = {
        ActivitySubtypes.Observation_Plant_Aquatic.name: [
            "aquaticplantobservationentry_set"
        ],
        ActivitySubtypes.Observation_Plant_Terrestrial.name: [
            "terrestrialplantobservationentries_set"
        ],
        ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: [
            "chemplantentryaquatic_set"
        ],
        ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: [
            "chemplantentryterrestrial_set"
        ],
        ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: [
            "aquaticplantmechanicaltreatmententry_set"
        ],
        ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: [
            "terrestrialplantmechanicaltreatmententry_set"
        ],
        ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: [
            "terrestrialbiocontroldispersalmonitoringentry_set"
        ],
        ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: [
            "terrestrialbiocontroldispersalmonitoringentry_set"
        ],
        ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: [
            "terrestrialtreatmentmonitoringentry_set",
            "aquatictreatmentmonitoringentry_set",
        ],
        ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: [
            "terrestrialtreatmentmonitoringentry_set",
            "aquatictreatmentmonitoringentry_set",
        ],
        ActivitySubtypes.Biocontrol_Collection.name: [
            "terrestrialbiocontrolcollectionentry_set"
        ],
        ActivitySubtypes.Biocontrol_Release.name: [
            "terrestrialbiocontrolreleaseentry_set"
        ],
    }


class DraftActivityAllPlantSerializer(BaseSerializer):
    """
    Entry For Serializing Activities to a Recordset Row. Covers Draft Activities.
    """

    # Dynamic property fields
    record_set_attr = "draftactivitydatarecord_set"

    class Meta(BaseSerializer.Meta):
        model = DraftActivity

    PATH_TO_PLANT_MAP = {
        ActivitySubtypes.Observation_Plant_Aquatic.name: [
            "draftaquaticplantobservationentry_set"
        ],
        ActivitySubtypes.Observation_Plant_Terrestrial.name: [
            "draftterrestrialplantobservationentries_set"
        ],
        ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: [
            "draftchemplantentryaquatic_set"
        ],
        ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: [
            "draftchemplantentryterrestrial_set"
        ],
        ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: [
            "draftaquaticplantmechanicaltreatmententry_set"
        ],
        ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: [
            "draftterrestrialplantmechanicaltreatmententry_set"
        ],
        ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: [
            "draftterrestrialbiocontroldispersalmonitoringentry_set"
        ],
        ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: [
            "draftterrestrialbiocontroldispersalmonitoringentry_set"
        ],
        ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: [
            "draftterrestrialtreatmentmonitoringentry_set",
            "draftaquatictreatmentmonitoringentry_set",
        ],
        ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: [
            "draftterrestrialtreatmentmonitoringentry_set",
            "draftaquatictreatmentmonitoringentry_set",
        ],
        ActivitySubtypes.Biocontrol_Collection.name: [
            "draftterrestrialbiocontrolcollectionentry_set"
        ],
        ActivitySubtypes.Biocontrol_Release.name: [
            "draftterrestrialbiocontrolreleaseentry_set"
        ],
    }
