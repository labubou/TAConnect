from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from instructor.models import OfficeHourSlot, BookingPolicy
from sharable_link.models import ShareableLink
from drf_yasg.utils import swagger_auto_schema
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


@swagger_auto_schema(
    method="post",
    operation_description="Generate a shareable link for office hours",
    responses={201: "Link created successfully"}
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_shareable_link(request):
    try:
        user = request.user
        course_name = request.data.get("course_name")
        section = request.data.get("section", "")
        access_type = request.data.get("access_type", "PUBLIC")
        
        if not course_name:
            return Response(
                {'error': 'Course name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if access_type not in dict(ShareableLink.ACCESS_CHOICES):
            return Response(
                {'error': f'Invalid access type. Must be one of: {", ".join(dict(ShareableLink.ACCESS_CHOICES).keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        link = ShareableLink.objects.create(
            instructor=user,
            course_name=course_name,
            section=section,
            access_type=access_type,
            
        )

        # Add allowed users if access type is PRIVATE
        if access_type == 'PRIVATE':
            allowed_users = request.data.get("allowed_users", [])
            link.allowed_users.set(allowed_users)

        return Response({
            'link_id': str(link.id),
            'url': f'/api/office-hours/{link.id}',
            'access_type': access_type
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error generating shareable link: {str(e)}")
        return Response(
            {'error': 'Failed to generate shareable link'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
def view_shared_slots(request, link_id):
    try:
        link = ShareableLink.objects.get(id=link_id)
        
        if not link.is_valid():
            return Response(
                {'error': 'This link is no longer valid'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not link.can_access(request.user):
            return Response(
                {'error': 'You do not have permission to access this link'},
                status=status.HTTP_403_FORBIDDEN
            )

        slots_data = [{
            'id': slot.id,
            'start_time': slot.start_time,
            'end_time': slot.end_time,
            'is_available': not slot.is_booked
        } for slot in slots]

        return Response(slots_data)

    except ShareableLink.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired link'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(["PATCH"])
#Use @api_view(["PATCH"]) ✅because you’re updating the status of an existing link, not creating or deleting a resource.
@permission_classes([IsAuthenticated])
#to deactivate the link temporarily 
def revoke_link(request, link_id):
    try:
        link = ShareableLink.objects.get(id=link_id, instructor=request.user)
        link.revoke()
        return Response({'message': 'Link revoked successfully'})
    except ShareableLink.DoesNotExist:
        return Response(
            {'error': 'Link not found'},
            status=status.HTTP_404_NOT_FOUND
        )
