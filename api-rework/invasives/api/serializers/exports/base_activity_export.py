from api.models.activity import Activity
from rest_framework import serializers

BASE_LEADING_HEADERS = [
    # Leading Common
    "ID",
    "Project Code",
    "Activity Date",
    "Area",
    "Latitude",
    "Longitude",
    "UTM Zone",
    "UTM Easting",
    "UTM Northing",
    "Employer",
    "Funding Agency",
    "Jurisdiction",
    "Access Description",
    "Location Description",
    "Comment",
    "Participants",
]

BASE_TRAILING_HEADERS = [
    "Elevation",
    "BEC Zone",
    "RISO Area(s)",
    "IPMA",
    "Ownership",
    "Regional Districts",
    "FLRNO District(s)",
    "MOTI District(s)",
    "Photo",
    "Geography",
    "Created",
]

BASE_SOURCE = "activity_data_record.activity"


class BaseActivityExportSerializer(serializers.Serializer):
    # Leading Common Fields
    short_id = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.short_id")
    project_code = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.project_code")
    activity_date = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.activity_date")
    area_m = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.area_m")
    latitude = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.latitude")
    longitude = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.longitude")
    utm_zone = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.utm_zone")
    utm_easting = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.utm_easting")
    utm_northing = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.utm_northing")
    access_description = serializers.ReadOnlyField(
        source=f"{BASE_SOURCE}.access_description"
    )
    location_description = serializers.ReadOnlyField(
        source=f"{BASE_SOURCE}.location_description"
    )
    comment = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.comment")
    jurisdiction = serializers.SerializerMethodField()
    employer = serializers.SerializerMethodField()
    agency = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()

    # Trailing Common Fields
    elevation = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.elevation")
    created_timestamp = serializers.ReadOnlyField(
        source=f"{BASE_SOURCE}.created_timestamp"
    )
    bec_zone = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.elevation")
    ipma = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.elevation")
    ownership = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.elevation")
    regional_districts = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.elevation")
    flnro_districts = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.elevation")
    moti_districts = serializers.ReadOnlyField(source=f"{BASE_SOURCE}.elevation")
    riso_areas = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()

    def get_jurisdiction(self, obj):
        activity = obj.activity_data_record.activity
        jurisdictions = []
        for record in activity.activitydatarecord_set.all():
            for j in record.jurisdiction_set.all():
                if j.jurisdiction:
                    jurisdictions.append(
                        f"{j.jurisdiction.full} ({j.percent_covered}%)"
                    )

        return ", ".join(sorted(set(jurisdictions))) or None

    def get_agency(self, obj):
        activity = obj.activity_data_record.activity
        agencies = []
        for record in activity.activitydatarecord_set.all():
            for a in record.fundingagency_set.all():
                if a.agency and hasattr(a.agency, "full"):
                    agencies.append(a.agency.full)
        return ", ".join(sorted(set(agencies))) or None

    def get_participants(self, obj):
        activity = obj.activity_data_record.activity
        participants = []
        for record in activity.activitydatarecord_set.all():
            for p in record.participant_set.all():
                name_str = p.name
                if p.pac_number and p.pac_number != "None":
                    name_str = f"{p.name} (PAC: {p.pac_number})"
                participants.append(name_str)
        return ", ".join(sorted(set(participants))) or None

    def get_employer(self, obj):
        activity = obj.activity_data_record.activity
        employers = []
        for record in activity.activitydatarecord_set.all():
            for a in record.employer_set.all():
                if a.employer and hasattr(a.employer, "full"):
                    employers.append(a.employer.full)
        return ", ".join(sorted(set(employers))) or None

    def get_riso_areas(self, obj):
        activity = obj.activity_data_record.activity
        risos = []
        for record in activity.activitydatarecord_set.all():
            for a in record.risoarea_set.all():
                if a.organization:
                    risos.append(a.organization)
        return ", ".join(sorted(set(risos))) or None

    def get_photo(self, obj):
        activity = obj.activity_data_record.activity
        for record in activity.activitydatarecord_set.all():
            if record.uploadedimage_set.all():
                return "Yes"
        return "No"
