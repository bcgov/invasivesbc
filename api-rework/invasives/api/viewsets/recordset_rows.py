from rest_framework import viewsets, status
from rest_framework.response import Response
from api.serializers.activity_recordset_row import ActivityRecordsetRowSerializer
from api.models.activity import Activity

class RecordsetRowsViewSet(viewsets.GenericViewSet):
    serializer_class = ActivityRecordsetRowSerializer
    STEP = 20

    def get_optimized_queryset(self):
        return Activity.objects.all().prefetch_related(
            'jurisdiction_set__jurisdiction',
            'projectcode_set',
            'fundingagency_set__agency',
            'aquaticplantobservationentry_set__invasive_plant',
            'terrestrialplantobservationentries_set__invasive_plant',
            'aquaticplantmechanicaltreatmententry_set__invasive_plant',
            'terrestrialplantmechanicaltreatmententry_set__invasive_plant',
            'terrestrialbiocontroldispersalmonitoringentry_set__invasive_plant',
            'terrestrialbiocontrolreleaseentry_set__invasive_plant',
            'aquatictreatmentmonitoringentry_set__invasive_plant',
            'terrestrialtreatmentmonitoringentry_set__invasive_plant',
            'terrestrialbiocontrolcollectionentry_set__invasive_plant',
            'terrestrialbiocontrolcollectionentry_set__biological_agent',
            'terrestrialbiocontrolreleaseentry_set__biocontrol_agent',
            'terrestrialbiocontroldispersalmonitoringentry_set__biocontrol_agent',
            # TODO: Add Chemical Treatment Entry Destinations
        ).order_by('id')[:self.STEP]

    def create(self, _):
        queryset = self.get_optimized_queryset()
        serializer = ActivityRecordsetRowSerializer(queryset, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
