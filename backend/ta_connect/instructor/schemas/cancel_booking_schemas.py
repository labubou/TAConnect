from drf_yasg import openapi

# Response schemas
cancel_booking_instructor_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(
            type=openapi.TYPE_BOOLEAN,
            description='Whether the cancellation was successful',
            example=True
        ),
        'booking_id': openapi.Schema(
            type=openapi.TYPE_INTEGER,
            description='ID of the cancelled booking',
            example=1
        ),
        'message': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Success message',
            example='Booking cancelled successfully.'
        ),
        'error': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Error message if cancellation failed'
        ),
    },
)

# Swagger decorator configuration
cancel_booking_instructor_swagger = {
    'operation_description': '''
Cancel a booking as an instructor (TA).

**Behavior:**
- Marks the booking as cancelled in the database
- Sends email notification to the student
- Only the instructor who owns the office hour slot can cancel bookings
- Cannot cancel already cancelled bookings

**Email Notification:**
The student will receive an email notification informing them that their booking has been cancelled by the instructor.

**Use Cases:**
- Instructor needs to cancel due to emergency
- Office hours need to be rescheduled
- Slot needs to be freed up for another student
    ''',
    'manual_parameters': [
        openapi.Parameter(
            'pk',
            openapi.IN_PATH,
            description='ID of the booking to cancel',
            type=openapi.TYPE_INTEGER,
            required=True,
            example=1
        )
    ],
    'responses': {
        200: openapi.Response(
            description='Booking cancelled successfully',
            schema=cancel_booking_instructor_response
        ),
        400: openapi.Response(
            description='Bad Request - Invalid booking ID or booking already cancelled'
        ),
        404: openapi.Response(
            description='Booking not found or not owned by this instructor'
        ),
        401: openapi.Response(
            description='Authentication required - Must be logged in as instructor'
        ),
        500: openapi.Response(
            description='Internal server error'
        )
    }
}
