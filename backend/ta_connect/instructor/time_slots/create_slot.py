from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from drf_yasg.utils import swagger_auto_schema
from instructor.schemas.time_slot_schemas import add_time_slot_request, add_time_slot_response
from accounts.permissions import IsInstructor, IsStudent
from instructor.serializers.create_slot_serializer import CreateSlotSerializer

@swagger_auto_schema(
    method="post",
    operation_description="Create a new office hour time slot for the logged-in instructor.",
    request_body=add_time_slot_request,
    responses={
        201: add_time_slot_response,
        400: "Invalid input data - missing required fields",
        500: "Internal server error - failed to create time slot"
    }
)
@api_view(["POST"])
@permission_classes([IsInstructor])
def add_time_slot(request):
    try:
        serializer = CreateSlotSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        time_slot, time_slot_policy = serializer.save()

        return Response({'success': True, 'time_slot_id': time_slot.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error in add_time_slot: {e}")
        return Response(
            {'error': 'An error occurred while creating the time slot'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
