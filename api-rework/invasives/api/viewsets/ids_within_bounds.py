from django.contrib.gis.geos import GEOSGeometry
from rest_framework import viewsets, status
from rest_framework.response import Response
from api.serializers.linked_record_query import LinkedRecordQuerySerializer
from api.models.activity import Activity
import json

class IdsWithinBoundsViewSet(viewsets.GenericViewSet):
    queryset = Activity.objects.all()
    serializer_class = LinkedRecordQuerySerializer


    def create(self, request):
        subtype = request.data.get('subtype')
        bounds = request.data.get('bounds')

        if not bounds:
            return Response(
                {"error": "The 'bounds' GeoJSON field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            search_geometry = GEOSGeometry(json.dumps(bounds))
            queryset = Activity.objects.filter(shape__intersects=search_geometry)

            if subtype: # apply additional filter
                queryset = queryset.filter(subtype=subtype)

            serializer = LinkedRecordQuerySerializer(queryset, many=True)

            return Response(data=serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Invalid Geometry or Query Error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
