import json
from rest_framework import serializers
from django.contrib.gis.db.models.functions import PointOnSurface, AsGeoJSON
from api.models.activity.activity import Activity, DraftActivity
from api.models.activity import (
    ActivitySubtypes,
    RisoArea,
    ProjectCode,
    FundingAgency,
    DraftProjectCode,
    DraftFundingAgency,
)
from api.serializers.activity import ActivitySerializer


class BaseSerializer(serializers.ModelSerializer):
    """
    Base Serializer class for displaying InvasivesBC Activities as part of a Recordset
    """

    # Stubbed
    PATH_TO_PLANT_MAP = {}
    PATH_TO_AGENT_MAP = {}

    # Dynamic property fields
    record_set_attr = None
    jurisdiction_set_attr = None
    project_code_model = None
    funding_agency_model = None

    reported_area = serializers.SerializerMethodField()
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
    regional_invasive_species_organization_areas = serializers.SerializerMethodField()
    regional_districts = serializers.CharField(
        source="computed_regional_districts", read_only=True
    )
    invasive_plant_management_areas = serializers.CharField(
        source="computed_invasive_plant_management_areas", read_only=True
    )
    biogeoclimatic_zones = serializers.CharField(
        source="computed_biogeoclimatic_zone", read_only=True
    )
    elevation = serializers.IntegerField(source="computed_elevation_m", read_only=True)
    activity_type = serializers.CharField(source="type", read_only=True)
    activity_subtype = serializers.CharField(source="subtype", read_only=True)
    activity_date = serializers.CharField(source="date", read_only=True)
    activity_id = serializers.CharField(source="id", read_only=True)

    class Meta:
        abstract = True
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
            "reported_area",
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
        """
        Helper for quickly matching a records subtype to list of plant locations.
        """
        dest = self.PATH_TO_PLANT_MAP.get(subtype)
        if isinstance(dest, str):
            return [dest]
        return dest

    def build_response_value(self, values):
        """Join response values to return to client"""
        return ", ".join(filter(None, values)) or None

    def get_geom(self, obj):
        """Cast stored geometry to point_on_surface and return to client (used for panning to activity / offline point layers)"""
        if obj.shape:
            return {
                "type": "Feature",
                "geometry": json.loads(obj.shape.point_on_surface.geojson),
            }
        return None

    def get_reported_area(self, obj):
        return getattr(obj, "area_m", None)

    def get_updated_by(self, obj):
        # TODO: Update when Auditing is added
        return getattr(obj, "created_by", None)

    def _get_records(self, obj):
        if not self.record_set_attr:
            return []
        return getattr(obj, self.record_set_attr).all()

    def get_jurisdiction_display(self, obj):
        if not self.jurisdiction_set_attr:
            return None

        jurisdictions = []
        for record in self._get_records(obj):
            for j in getattr(record, self.jurisdiction_set_attr).all():
                full_name = j.jurisdiction.full if j.jurisdiction else ""
                jurisdictions.append(f"{full_name} ({j.percent_covered}%)")
        return self.build_response_value(jurisdictions)

    def get_project_code(self, obj):
        codes = (
            self.project_code_model.objects.filter(activity_data_record__activity=obj)
            .values_list("description", flat=True)
            .distinct()
            .order_by("description")
        )
        return ", ".join(codes)

    def get_agency(self, obj):
        if not self.funding_agency_model:
            return None
        agencies = (
            self.funding_agency_model.objects.filter(activity_data_record__activity=obj)
            .values_list("agency__full", flat=True)
            .distinct()
            .order_by("agency__full")
        )
        return ", ".join(agencies)

    def _get_plant_entries(self, obj):
        destinations = self.get_entry_destination(obj.subtype)
        for record in self._get_records(obj):
            for destination in destinations:
                # Some draft items might be missing destination attributes
                if hasattr(record, destination):
                    yield from getattr(record, destination).all()

    def get_invasive_plant(self, obj):
        plants = [
            e.invasive_plant.full
            for e in self._get_plant_entries(obj)
            if e.invasive_plant
        ]
        return self.build_response_value(plants)

    def _get_species_observation(self, obj, observation_type):
        """Fetch plants from observation records based on negative/positive sighting"""
        is_observation = ActivitySubtypes[obj.subtype].typeOfActivity == "Observation"
        if not is_observation:
            return None

        plants = [
            e.invasive_plant.full
            for e in self._get_plant_entries(obj)
            if getattr(e, "observation_type", None) == observation_type
            and e.invasive_plant
        ]
        return self.build_response_value(plants)

    def get_species_positive_full(self, obj):
        return self._get_species_observation(obj, "Positive")

    def get_species_negative_full(self, obj):
        return self._get_species_observation(obj, "Negative")

    def get_species_treated_full(self, obj):
        activity_type = ActivitySubtypes[obj.subtype].typeOfActivity
        if activity_type not in ["Treatment", "Biocontrol", "Monitoring"]:
            return None

        plants = [
            e.invasive_plant.full
            for e in self._get_plant_entries(obj)
            if e.invasive_plant
        ]
        return self.build_response_value(plants)

    def get_species_biocontrol_full(self, obj):
        config = self.PATH_TO_AGENT_MAP.get(obj.subtype)
        if not config:
            return None

        agents = []
        for record in self._get_records(obj):
            if hasattr(record, config["set"]):
                for e in getattr(record, config["set"]).all():
                    agent_obj = getattr(e, config["key"], None)
                    if agent_obj and hasattr(agent_obj, "full"):
                        agents.append(agent_obj.full)

        return self.build_response_value(agents)


class ActivityRecordsetRowSerializer(BaseSerializer):
    """
    Entry For Serializing Activities to a Recordset Row. Covers all Submission entries
    """

    # Dynamic property fields
    record_set_attr = "activitydatarecord_set"
    jurisdiction_set_attr = "jurisdiction_set"
    project_code_model = ProjectCode
    funding_agency_model = FundingAgency

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
            "chemicaltreatmentaquaticinvasiveplantrecord_set"
        ],
        ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: [
            "chemicaltreatmentterrestrialinvasiveplantrecord_set"
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

    def get_regional_invasive_species_organization_areas(self, obj):
        risos = (
            RisoArea.objects.filter(activity_data_record__activity=obj)
            .values_list("organization", flat=True)
            .distinct()
            .order_by("organization")
        )
        return ", ".join(risos)


class DraftActivityRecordsetRowSerializer(BaseSerializer):
    """
    Entry For Serializing Activities to a Recordset Row. Covers Draft Activities.
    """

    # Dynamic property fields
    record_set_attr = "draftactivitydatarecord_set"
    jurisdiction_set_attr = "draftjurisdiction_set"
    project_code_model = DraftProjectCode
    funding_agency_model = DraftFundingAgency

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
            # TODO: Implement
        ],
        ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial.name: [
            # TODO: Implement
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

    PATH_TO_AGENT_MAP = {
        ActivitySubtypes.Biocontrol_Collection.name: {
            "set": "draftterrestrialbiocontrolcollectionentry_set",
            "key": "biological_agent",
        },
        ActivitySubtypes.Biocontrol_Release.name: {
            "set": "draftterrestrialbiocontrolreleaseentry_set",
            "key": "biocontrol_agent",
        },
        ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial.name: {
            "set": "draftterrestrialbiocontroldispersalmonitoringentry_set",
            "key": "biocontrol_agent",
        },
        ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial.name: {
            "set": "draftterrestrialbiocontroldispersalmonitoringentry_set",
            "key": "biocontrol_agent",
        },
    }

    def get_regional_invasive_species_organization_areas(self, obj):
        # Draft Records don't have computed fields, so simply return Null.
        return None


class CachedActivityRecordsetRowSerializer(ActivityRecordsetRowSerializer):
    data = serializers.SerializerMethodField()

    class Meta(ActivityRecordsetRowSerializer.Meta):
        fields = ActivityRecordsetRowSerializer.Meta.fields + ("data",)

    def get_data(self, obj):
        # Refetch the object and annotate the centroid value.
        annotated_obj = Activity.objects.annotate(
            centroid=AsGeoJSON(PointOnSurface("shape"))
        ).get(pk=obj.pk)

        return ActivitySerializer(annotated_obj, context=self.context).data
