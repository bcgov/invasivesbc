from rest_framework import viewsets, status
from rest_framework.response import Response
from django.core.exceptions import FieldError
from django.db.models import Q, F, Min
from django.db.models.functions import Coalesce
from api.serializers.activity_recordset_row import ActivityRecordsetRowSerializer
from api.models.activity import Activity


class RecordsetRowsViewSet(viewsets.GenericViewSet):
    serializer_class = ActivityRecordsetRowSerializer

    def create(self, request, *args, **kwargs):
        return self.get_rows_by_criteria(request, *args, **kwargs)

    def get_rows_by_criteria(self, request):
        """
        TODO: Build out further, add spatial filters, convert some column fields ('activity_subtype' -> 'subtype') where appropriate.
              Meant as a starting point to help expand rest of in-app functionality.
        """
        filter_objects = request.data.get("filterObjects", [])
        meta = filter_objects[0] if filter_objects else {}

        page = int(meta.get("page", 0))
        limit = int(meta.get("limit", 10))
        sort_column = meta.get("sortColumn", "date").replace("activity_", "")

        sort_mapping = {
            "project_code": "activitydatarecord__projectcode__description",
            "agency": "activitydatarecord__fundingagency__agency__full",
            "jurisdiction_display": "activitydatarecord__jurisdiction__jurisdiction__full",
            "activity_id": "id",
            "activity_type": "type",
            "activity_subtype": "subtype",
            "activity_date": "date",
            "invasive_plant": "activitydatarecord__terrestrialplantobservationentries__invasive_plant__full",
            "regional_invasive_species_organization_areas": "computed_invasive_plant_management_areas",
            "regional_districts": "computed_regional_districts",
            "ownership": "computed_ownership",
            "moti_districts": "computed_moti_districts",
            "invasive_plant_management_areas": "computed_invasive_plant_management_areas",
            "biogeoclimatic_zones": "computed_biogeoclimatic_zone",
            "elevation": "computed_elevation_m",
            "updated_by": "created_by"
        }
        # Use the mapped path if it exists, otherwise use the raw column name
        db_column = sort_mapping.get(sort_column, sort_column)

        queryset = Activity.objects.all().prefetch_related(
            "activitydatarecord_set__jurisdiction_set__jurisdiction",
            "activitydatarecord_set__projectcode_set",
            "activitydatarecord_set__fundingagency_set__agency",
            "activitydatarecord_set__aquaticplantobservationentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialplantobservationentries_set__invasive_plant",
            "activitydatarecord_set__aquaticplantmechanicaltreatmententry_set__invasive_plant",
            "activitydatarecord_set__terrestrialplantmechanicaltreatmententry_set__invasive_plant",
            "activitydatarecord_set__terrestrialbiocontroldispersalmonitoringentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialbiocontrolreleaseentry_set__invasive_plant",
            "activitydatarecord_set__aquatictreatmentmonitoringentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialtreatmentmonitoringentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialbiocontrolcollectionentry_set__invasive_plant",
            "activitydatarecord_set__terrestrialbiocontrolcollectionentry_set__biological_agent",
            "activitydatarecord_set__terrestrialbiocontrolreleaseentry_set__biocontrol_agent",
            "activitydatarecord_set__terrestrialbiocontroldispersalmonitoringentry_set__biocontrol_agent",
            "activitydatarecord_set__terrestrialbiocontroldispersalmonitoringentry_set__invasive_plant",
        )

        if sort_column == "species_negative_full":
            is_negative_observation = Q(type="Observation") & (
                Q(
                    activitydatarecord__terrestrialplantobservationentries__observation_type="Negative",
                    activitydatarecord__terrestrialplantobservationentries__invasive_plant__isnull=False,
                )
                | Q(
                    activitydatarecord__aquaticplantobservationentry__observation_type="Negative",
                    activitydatarecord__aquaticplantobservationentry__invasive_plant__isnull=False,
                )
            )
            queryset = queryset.annotate(
                species_sort=Min(Coalesce(
                    "activitydatarecord__aquaticplantobservationentry__invasive_plant__full",
                    "activitydatarecord__terrestrialplantobservationentries__invasive_plant__full",
                ),
                filter=is_negative_observation),
            )
            order_by = "species_sort"

        elif sort_column == "species_positive_full":
            is_positive_observation = Q(type="Observation") & (
                Q(
                    activitydatarecord__terrestrialplantobservationentries__observation_type="Positive",
                    activitydatarecord__terrestrialplantobservationentries__invasive_plant__isnull=False,
                )
                | Q(
                    activitydatarecord__aquaticplantobservationentry__observation_type="Positive",
                    activitydatarecord__aquaticplantobservationentry__invasive_plant__isnull=False,
                )
            )
            queryset = queryset.annotate(
                species_sort=Min(Coalesce(
                    "activitydatarecord__aquaticplantobservationentry__invasive_plant__full",
                    "activitydatarecord__terrestrialplantobservationentries__invasive_plant__full",
                ),
                filter=is_positive_observation),
            )
            order_by = "species_sort"

        elif sort_column in "invasive_plant" :
            # For general plants, we look across all tables
            queryset = queryset.annotate(
                species_sort=Coalesce(
                    "activitydatarecord__aquaticplantobservationentry__invasive_plant__full",
                    "activitydatarecord__terrestrialplantobservationentries__invasive_plant__full",
                    "activitydatarecord__aquaticplantmechanicaltreatmententry__invasive_plant__full",
                    "activitydatarecord__terrestrialplantmechanicaltreatmententry__invasive_plant__full",
                    "activitydatarecord__terrestrialtreatmentmonitoringentry__invasive_plant__full",
                    "activitydatarecord__terrestrialbiocontroldispersalmonitoringentry__invasive_plant__full",
                    "activitydatarecord__terrestrialbiocontrolreleaseentry__invasive_plant__full",
                    "activitydatarecord__aquatictreatmentmonitoringentry__invasive_plant__full",
                    "activitydatarecord__chemicaltreatmentaquaticinvasiveplantrecord__invasive_plant__full",
                    "activitydatarecord__chemicaltreatmentterrestrialinvasiveplantrecord__invasive_plant__full"
                )
            )
            order_by = "species_sort"
        elif sort_column == "species_treated_full":
            queryset = queryset.annotate(
                species_sort=Coalesce(
                    "activitydatarecord__aquaticplantmechanicaltreatmententry__invasive_plant__full",
                    "activitydatarecord__terrestrialplantmechanicaltreatmententry__invasive_plant__full",
                    "activitydatarecord__terrestrialtreatmentmonitoringentry__invasive_plant__full",
                    "activitydatarecord__terrestrialbiocontroldispersalmonitoringentry__invasive_plant__full",
                    "activitydatarecord__terrestrialbiocontrolreleaseentry__invasive_plant__full",
                    "activitydatarecord__aquatictreatmentmonitoringentry__invasive_plant__full",
                    "activitydatarecord__chemicaltreatmentaquaticinvasiveplantrecord__invasive_plant__full",
                    "activitydatarecord__chemicaltreatmentterrestrialinvasiveplantrecord__invasive_plant__full"
                )
            )
            order_by = "species_sort"
        elif sort_column == 'species_biocontrol_full':
            queryset = queryset.annotate(
                species_sort=Min(Coalesce(
                    "activitydatarecord__terrestrialbiocontrolcollectionentry__biological_agent__full",
                    "activitydatarecord__terrestrialbiocontrolreleaseentry__biocontrol_agent__full",
                    "activitydatarecord__terrestrialbiocontroldispersalmonitoringentry__biocontrol_agent__full",
                ))
            )
            order_by = "species_sort"
        else:
            order_by = db_column

        final_query = Q()
        for obj in filter_objects:
            for f in obj.get("tableFilters", []):
                field = f.get("field").replace(
                    "activity_", ""
                )  # Ensure field matches model
                value = f.get("filter")
                operator = f.get("operator")
                logic_gate = f.get("operator2", "AND")

                lookup = f"{field}__icontains"
                current_q = (
                    ~Q(**{lookup: value})
                    if operator == "DOES NOT CONTAIN"
                    else Q(**{lookup: value})
                )

                if logic_gate == "OR":
                    final_query |= current_q
                else:
                    final_query &= current_q

        if final_query:
            queryset = queryset.filter(final_query)

        start = page * limit
        stop = start + limit

        try:
            if meta.get("sortOrder", "") == "ASC":
                order_expression = F(order_by).asc(nulls_last=True)
            else:
                order_expression = F(order_by).desc(nulls_last=True)

            results = queryset.order_by(order_expression).distinct()[start:stop]
        except FieldError as e:
            print(e)
            results = queryset.order_by("date").distinct()[start:stop]

        serializer = ActivityRecordsetRowSerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
