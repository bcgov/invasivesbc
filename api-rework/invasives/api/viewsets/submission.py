from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
import uuid
from datetime import datetime

class SubmissionViewSet(viewsets.ViewSet):

    def mock_record_id(self):
        """Mock Function for generating short ID's"""
        year_prefix = datetime.now().strftime('%y')
        id = uuid.uuid4()
        short_id = f"{year_prefix}PTO{id.hex[:8]}"
        return {"short_id": short_id.upper(), "id": str(id)}

    @action(detail=False, methods=['post'])
    def draft(self, _):
        return Response(self.mock_record_id(), status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def submit(self, _):
        return Response(self.mock_record_id(), status=status.HTTP_201_CREATED)
