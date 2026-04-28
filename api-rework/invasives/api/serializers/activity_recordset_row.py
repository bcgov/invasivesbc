import json
from rest_framework import serializers
from api.models.activity.activity import Activity
from api.models.activity import ActivitySubtypes


class ActivityRecordsetRowSerializer(serializers.ModelSerializer):
    """
    Entry For Serializing Activities to a Recordset Row
    """

    geom = serializers.SerializerMethodField()
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
        ActivitySubtypes.Treatment_Chemical_Plant_Aquatic.name: "chemicaltreatmentaquaticinvasiveplantrecord_set",
        ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: "chemicaltreatmentterrestrialinvasiveplantrecord_set",
        ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic.name: "aquaticplantmechanicaltreatmententry_set",
        ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial.name: "terrestrialplantmechanicaltreatmententry_set",
        ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: "terrestrialbiocontroldispersalmonitoringentry_set",
        ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: "terrestrialbiocontroldispersalmonitoringentry_set",
        ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic.name: "terrestrialtreatmentmonitoringentry_set",
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
        ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: {
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
            "geom",
        )

    def get_entry_destination(self, subtype):
        return self.PATH_TO_PLANT_MAP.get(subtype)

    def build_response_value(self, values):
        """Join response values to return to client"""
        return ", ".join(filter(None, values)) or None

    def get_geom(self, obj):
        return {
            "type": "Feature",
            "geometry": json.loads(obj.shape.geojson),
        }

    def get_invasive_plant(self, obj):
        """Fetch the Invasive Plant for all records associated with this activity"""
        destination = self.get_entry_destination(obj.subtype)
        if not destination:
            return None

        all_plants = []
        for record in obj.activitydatarecord_set.all():
            entries = getattr(record, destination).all()
            all_plants.extend(
                [e.invasive_plant.full for e in entries if e.invasive_plant]
            )

        return self.build_response_value(sorted(set(all_plants)))

    def get_species_positive_full(self, obj):
        """Fetch Positive species values from all associated DataRecords"""
        destination = self.get_entry_destination(obj.subtype)
        if not destination:
            return None

        is_observation = ActivitySubtypes[obj.subtype].typeOfActivity == "Observation"
        plants = []

        for record in obj.activitydatarecord_set.all():
            entries = getattr(record, destination).all()
            for e in entries:
                if (
                    is_observation
                    and getattr(e, "observation_type", None) == "Positive"
                    and e.invasive_plant
                ):
                    plants.append(e.invasive_plant.full)

        return self.build_response_value(sorted(set(plants)))

    def get_species_negative_full(self, obj):
        """Fetch Negative Species (Only for Observations)"""
        if ActivitySubtypes[obj.subtype].typeOfActivity != "Observation":
            return None

        destination = self.get_entry_destination(obj.subtype)
        if not destination:
            return None

        is_observation = ActivitySubtypes[obj.subtype].typeOfActivity == "Observation"
        plants = []

        for record in obj.activitydatarecord_set.all():
            entries = getattr(record, destination).all()
            for e in entries:
                if (
                    is_observation
                    and getattr(e, "observation_type", None) == "Negative"
                    and e.invasive_plant
                ):
                    plants.append(e.invasive_plant.full)

        return self.build_response_value(sorted(set(plants)))

    def get_species_treated_full(self, obj):
        """Fetch Treated Species from all associated DataRecords"""
        activity_type = ActivitySubtypes[obj.subtype].typeOfActivity
        if activity_type not in ["Treatment", "Biocontrol", "Monitoring"]:
            return None

        destination = self.get_entry_destination(obj.subtype)
        if not destination:
            return None

        plants = []
        for record in obj.activitydatarecord_set.all():
            entries = getattr(record, destination).all()
            plants.extend([e.invasive_plant.full for e in entries if e.invasive_plant])
        return self.build_response_value(sorted(set(plants)))

    def get_species_biocontrol_full(self, obj):
        """Transform Biocontrol agents across all records into string names"""
        config = self.PATH_TO_AGENT_MAP.get(obj.subtype)
        if not config:
            return None

        agents = []
        for record in obj.activitydatarecord_set.all():
            entries = getattr(record, config["set"]).all()
            for e in entries:
                agent_obj = getattr(e, config["key"], None)
                if agent_obj and hasattr(agent_obj, "full"):
                    agents.append(agent_obj.full)

        return self.build_response_value(sorted(set(agents)))

    def get_jurisdiction_display(self, obj):
        """
        Aggregates jurisdictions across all data records for this activity
        """
        jurisdictions = []
        for record in obj.activitydatarecord_set.all():
            for j in record.jurisdiction_set.all():
                jurisdictions.append(f"{j.jurisdiction.full} ({j.percent_covered}%)")

        return ", ".join(sorted(set(jurisdictions))) or None

    def get_project_code(self, obj):
        codes = []
        for record in obj.activitydatarecord_set.all():
            codes.extend([p.description for p in record.projectcode_set.all()])
        return ", ".join(sorted(set(codes))) or None

    def get_agency(self, obj):
        """
        Aggregates funding agencies across all DataRecords linked to this Activity.
        """
        agencies = []
        for record in obj.activitydatarecord_set.all():
            for a in record.fundingagency_set.all():
                if a.agency and hasattr(a.agency, "full"):
                    agencies.append(a.agency.full)

        return self.build_response_value(sorted(set(agencies)))

    def get_updated_by(self, obj):
        # TODO: Update when Auditing is added
        return obj.created_by
