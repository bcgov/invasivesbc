import json
from rest_framework import serializers
from django.contrib.gis.db.models.functions import Centroid, AsGeoJSON
from silk.profiling.profiler import silk_profile

from api.models.activity.activity import Activity
from api.models.activity import (
    ActivitySubtypes,
    RisoArea,
    ProjectCode,
    FundingAgency,
    Jurisdiction,
)
from api.serializers.activity import ActivitySerializer


class ActivityRecordsetRowSerializer(serializers.ModelSerializer):
    """
    Entry For Serializing Activities to a Recordset Row
    """

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

    def get_geom(self, obj):
        return {
            "type": "Feature",
            "geometry": json.loads(obj.shape.geojson),
        }

    def get_invasive_plant(self, obj):
        return ", ".join(
            obj.invasive_plants
        )  # point of style -- I'd rather just return the list and let the particular serialization format join it into a string if needed (eg yes for CSV, no for JSON). joining for now. change later.

    def get_reported_area(self, obj):
        return obj.area_m

    def get_species_positive_full(self, obj):
        return ", ".join(
            obj.species_positive_full
        )  # point of style -- I'd rather just return the list and let the particular serialization format join it into a string if needed (eg yes for CSV, no for JSON). joining for now. change later.

    def get_species_negative_full(self, obj):
        return ", ".join(
            obj.species_negative_full
        )  # point of style -- I'd rather just return the list and let the particular serialization format join it into a string if needed (eg yes for CSV, no for JSON). joining for now. change later.

    def get_species_treated_full(self, obj):
        return ", ".join(
            obj.species_treated_full
        )  # point of style -- I'd rather just return the list and let the particular serialization format join it into a string if needed (eg yes for CSV, no for JSON). joining for now. change later.

    def get_species_biocontrol_full(self, obj):
        return ", ".join(
            obj.biocontrol_full
        )  # point of style -- I'd rather just return the list and let the particular serialization format join it into a string if needed (eg yes for CSV, no for JSON). joining for now. change later.

    def get_regional_invasive_species_organization_areas(self, obj):
        risos = (
            RisoArea.objects.filter(activity_data_record__activity=obj)
            .values_list("organization", flat=True)
            .distinct()
            .order_by("organization")
        )
        return ", ".join(risos)

    def get_jurisdiction_display(self, obj):
        """
        Aggregates jurisdictions across all data records for this activity
        """
        jurisdictions = []

        for j in (
            Jurisdiction.objects.filter(activity_data_record__activity_id=obj.id)
            .values_list("jurisdiction__full", "percent_covered")
            .order_by("jurisdiction__full")
        ):
            jurisdictions.append(f"{j[0]} ({j[1]}%)")

        return ", ".join(jurisdictions)

    def get_project_code(self, obj):
        codes = (
            ProjectCode.objects.filter(activity_data_record__activity=obj)
            .values_list("description", flat=True)
            .distinct()
            .order_by("description")
        )
        return ", ".join(codes)

    def get_agency(self, obj):
        """
        Aggregates funding agencies across all DataRecords linked to this Activity.
        """
        agencies = (
            FundingAgency.objects.filter(activity_data_record__activity=obj)
            .values_list("agency__full", flat=True)
            .distinct()
            .order_by("agency__full")
        )
        return ", ".join(agencies)

    def get_updated_by(self, obj):
        # TODO: Update when Auditing is added
        return obj.created_by


class CachedActivityRecordsetRowSerializer(ActivityRecordsetRowSerializer):
    data = serializers.SerializerMethodField()

    class Meta(ActivityRecordsetRowSerializer.Meta):
        fields = ActivityRecordsetRowSerializer.Meta.fields + ("data",)

    @silk_profile("data serializer")
    def get_data(self, obj):
        return ActivitySerializer(obj, context=self.context).data
