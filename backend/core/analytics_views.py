from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import PlatformEvent

class TrackEventAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        event_type = request.data.get('event_type')
        if not event_type:
            return Response({"error": "event_type is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        valid_event_types = [choice[0] for choice in PlatformEvent.EVENT_TYPES]
        if event_type not in valid_event_types:
             return Response({"error": "invalid event_type"}, status=status.HTTP_400_BAD_REQUEST)
        
        metadata = request.data.get('metadata', {})
        user = request.user if request.user.is_authenticated else None

        PlatformEvent.objects.create(
            event_type=event_type,
            metadata=metadata,
            user=user
        )

        return Response({"status": "event tracked successfully"})
