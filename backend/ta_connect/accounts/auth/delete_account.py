from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema

from ..serializers.delete_user_serializer import DeleteUserSerializer
from ..schemas.delete_account_schema import (
    delete_account_request_schema,
    delete_account_responses,
)
from utils.email_sending.auth.send_delete_account_email import send_delete_account_email
from utils.error_formatter import format_serializer_errors
from student.utils.cancel_student_bookings import cancel_student_bookings
from instructor.models import OfficeHourSlot

class DeleteAccountView(GenericAPIView):
    """Delete logged-in user account"""
    serializer_class = DeleteUserSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description='Delete logged-in user account. Requires password confirmation.',
        operation_summary='Delete User Account',
        request_body=delete_account_request_schema,
        responses=delete_account_responses,
    )
    def post(self, request):
        try:
            user = request.user
            serializer = self.get_serializer(data=request.data, context={'user': user})
            
            if not serializer.is_valid():
                return Response(
                    format_serializer_errors(serializer.errors),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            #get user time slots and cancel bookings if instructor
            if user.user_type == 'instructor':
                time_slots = OfficeHourSlot.objects.filter(instructor=user)
                for slot in time_slots:
                    # Cancel all student bookings for this slot
                    cancel_student_bookings(slot, cancellation_reason='manual')

                    # Delete slot policy and allowed students if applicable
                    if slot.policy.require_specific_email:
                        slot.policy.allowed_students.all().delete()
                    slot.policy.delete()
                    slot.delete()

                # Delete all time slots for the instructor if there are left any
                time_slots.delete()

            elif user.user_type == 'student':
                # Cancel all student bookings
                student_bookings = user.bookings.filter(is_cancelled=False, is_completed=False)
                msg, error = cancel_student_bookings(None, bookings=student_bookings, cancellation_reason='manual')
                if error:
                    print(f"Error cancelling student bookings during account deletion: {error}")
                    return Response(
                        {'error': 'Failed to cancel student bookings before account deletion.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # Store email before deletion
            user_email = user.email
            user.delete()
            
            # Send deletion notification email
            try:
                send_delete_account_email(user_email)
            except Exception:
                return Response(
                    {'message': 'User Deleted successfully. However, we could not send the account deletion email notification.'},
                    status=status.HTTP_200_OK
                )

            return Response(
                {'message': 'User deleted successfully.'},
                status=status.HTTP_200_OK
            )
                
        except Exception:
            return Response(
                {'error': 'An error occurred during account deletion. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
