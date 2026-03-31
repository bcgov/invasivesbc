from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from api.serializers.activity_recordset_row import ActivityRecordsetRowSerializer
from api.models.activity import Activity


class RecordsetRowsViewSet(viewsets.GenericViewSet):
    serializer_class = ActivityRecordsetRowSerializer

    def create(self, request):
        """
        TODO: Build out further, add spatial filters, convert some column fields ('activity_subtype' -> 'subtype') where appropriate.
              Meant as a starting point to help expand rest of in-app functionality.
        """
        filter_objects = request.data.get("filterObjects", [])
        meta = filter_objects[0] if filter_objects else {}

        page = int(meta.get("page", 0))
        limit = int(meta.get("limit", 10))
        sort_order = "" if meta.get("sortOrder", "") == "ASC" else "-"
        sort_column = meta.get("sortColumn", "date").replace("activity_", "")
        order_by = sort_order + sort_column

        queryset = Activity.objects.all().prefetch_related(
            "jurisdiction_set__jurisdiction",
            "projectcode_set",
            "fundingagency_set__agency",
            "aquaticplantobservationentry_set__invasive_plant",
            "terrestrialplantobservationentries_set__invasive_plant",
            "aquaticplantmechanicaltreatmententry_set__invasive_plant",
            "terrestrialplantmechanicaltreatmententry_set__invasive_plant",
            "terrestrialbiocontroldispersalmonitoringentry_set__invasive_plant",
            "terrestrialbiocontrolreleaseentry_set__invasive_plant",
            "aquatictreatmentmonitoringentry_set__invasive_plant",
            "terrestrialtreatmentmonitoringentry_set__invasive_plant",
            "terrestrialbiocontrolcollectionentry_set__invasive_plant",
            "terrestrialbiocontrolcollectionentry_set__biological_agent",
            "terrestrialbiocontrolreleaseentry_set__biocontrol_agent",
            "terrestrialbiocontroldispersalmonitoringentry_set__biocontrol_agent",
        )

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

        results = queryset.order_by(order_by)[start:stop]

        serializer = ActivityRecordsetRowSerializer(results, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
