from django.contrib.gis.serializers.geojson import JSONSerializer as GeoJSONSerializer
from rest_framework import serializers
from api.models.activity.activity import Activity
from api.models.activity import ActivitySubtypes


class ActivityRecordsetRowSerializer(serializers.ModelSerializer):
    """
    Entry For Serializing Activities to a Recordset Row
    """

    invasive_plant = serializers.SerializerMethodField()
    species_positive_full = serializers.SerializerMethodField()
    species_negative_full = serializers.SerializerMethodField()
    species_treated_full = serializers.SerializerMethodField()
    species_biocontrol_full = serializers.SerializerMethodField()
    jurisdiction_display = serializers.SerializerMethodField()
    project_code = serializers.SerializerMethodField()
    agency = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    regional_invasive_species_organization_areas = serializers.CharField(
        source="computed_regional_invasive_species_organization_areas", read_only=True
    )
    regional_districts = serializers.CharField(
        source="computed_regional_districts", read_only=True
    )
    invasive_plant_management_areas = serializers.CharField(
        source="computed_invasive_plant_management_areas", read_only=True
    )
    biogeoclimatic_zones = serializers.CharField(
        source="computed_biogeoclimactic_zone", read_only=True
    )
    elevation = serializers.IntegerField(source="computed_elevation_m", read_only=True)
    activity_type = serializers.CharField(source="type", read_only=True)
    activity_subtype = serializers.CharField(source="subtype", read_only=True)
    activity_date = serializers.CharField(source="date", read_only=True)
    activity_id = serializers.CharField(source="id", read_only=True)

    PATH_TO_PLANT_MAP = {
        ActivitySubtypes.Observation_Plant_Aquatic.name: "aquaticplantobservationentry_set",
        ActivitySubtypes.Observation_Plant_Terrestrial.name: "terrestrialplantobservationentries_set",
        ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: "",  # TODO when calculations added
        ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: "",  # TODO when calculations added
        ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: "aquaticplantmechanicaltreatmententry_set",
        ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: "terrestrialplantmechanicaltreatmententry_set",
        ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: "terrestrialbiocontroldispersalmonitoringentry_set",
        ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: "terrestrialbiocontrolreleaseentry_set",
        ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: "aquatictreatmentmonitoringentry_set",
        ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic.name: "terrestrialtreatmentmonitoringentry_set",
        ActivitySubtypes.Biocontrol_Collection.name: "terrestrialbiocontrolcollectionentry_set",
        ActivitySubtypes.Biocontrol_Release.name: "terrestrialbiocontrolreleaseentry_set",
    }

    PATH_TO_AGENT_MAP = {
        ActivitySubtypes.Biocontrol_Collection.name: {
            "set": "terrestrialbiocontrolcollectionentry_set",
            "key": "biological_agent",
        },
        ActivitySubtypes.Biocontrol_Release.name: {
            "set": "terrestrialbiocontrolreleaseentry_set",
            "key": "biocontrol_agent",
        },
        ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: {
            "set": "terrestrialbiocontroldispersalmonitoringentry_set",
            "key": "biocontrol_agent",
        },
    }

    class Meta:
        model = Activity
        fields = (
            "short_id",
            "activity_id",
            "activity_type",
            "activity_subtype",
            "activity_date",
            "project_code",
            "jurisdiction_display",
            "invasive_plant",
            "species_positive_full",
            "species_negative_full",
            "species_treated_full",
            "species_biocontrol_full",
            "created_by",
            "updated_by",
            "agency",
            "regional_invasive_species_organization_areas",
            "regional_districts",
            "invasive_plant_management_areas",
            "biogeoclimatic_zones",
            "elevation",
            "batch_id",
        )

    def get_entry_destination(self, subtype):
        return self.PATH_TO_PLANT_MAP.get(subtype)

    def build_response_value(self, values):
        """Join response values to return to client"""
        return ", ".join(filter(None, values)) or None

    def get_invasive_plant(self, obj):
        """Fetch the Invasive Plant for a record"""
        destination = self.get_entry_destination(obj.subtype)
        if destination:
            entries = getattr(obj, destination).all()
            plants = [e.invasive_plant.full for e in entries]
            return self.build_response_value(set(plants))

    def get_species_positive_full(self, obj):
        """Fetch Positive species values from a form (Any Non-Negative Observation is a Positive Species)"""
        destination = self.get_entry_destination(obj.subtype)
        if destination:
            entries = getattr(obj, destination).all()
            is_observation = (
                ActivitySubtypes[obj.subtype].typeOfActivity == "Observation"
            )
            plants = [
                e.invasive_plant.full
                for e in entries
                if not is_observation
                or getattr(e, "observation_type", None) == "Positive"
            ]
            return self.build_response_value(set(plants))

    def get_species_negative_full(self, obj):
        """Fetch Negative Species from a form (Only Observations can contain Negative species)"""
        if ActivitySubtypes[obj.subtype].typeOfActivity == "Observation":
            destination = self.get_entry_destination(obj.subtype)
            if destination:
                entries = getattr(obj, destination).all()
                plants = [
                    e.invasive_plant.full
                    for e in entries
                    if getattr(e, "observation_type", None) == "Negative"
                ]
                return self.build_response_value(set(plants))

    def get_species_treated_full(self, obj):
        """Fetch List of Treated Species (Any Non-Observation record contains a Treated Species)"""
        activity_type = ActivitySubtypes[obj.subtype].typeOfActivity
        if activity_type in ["Treatment", "Biocontrol", "Monitoring"]:
            destination = self.get_entry_destination(obj.subtype)
            if destination:
                entries = getattr(obj, destination).all()
                plants = [e.invasive_plant.full for e in entries]
                return self.build_response_value(set(plants))

    def get_species_biocontrol_full(self, obj):
        """Transform Biocontrol records into stringified agent names"""
        config = self.PATH_TO_AGENT_MAP.get(obj.subtype)
        if config:
            entries = getattr(obj, config["set"]).all()
            agents = [getattr(getattr(e, config["key"]), "full", None) for e in entries]
            return self.build_response_value(set(agents))
        return None

    def get_jurisdiction_display(self, obj):
        # Accessing prefetched data in memory
        items = [
            f"{j.jurisdiction.full} ({j.percent_covered}%)"
            for j in obj.jurisdiction_set.all()
        ]
        return ", ".join(items) or None

    def get_project_code(self, obj):
        return ", ".join([p.description for p in obj.projectcode_set.all()]) or None

    def get_agency(self, obj):
        return ", ".join([a.agency.full for a in obj.fundingagency_set.all()]) or None

    def get_updated_by(self, obj):
        # TODO: Update when Auditing is added
        return obj.created_by
