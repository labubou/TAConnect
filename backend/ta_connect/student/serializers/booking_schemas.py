from drf_yasg import openapi

# Schema for a single booking response
booking_detail_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Booking ID', example=1),
        'student': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                'username': openapi.Schema(type=openapi.TYPE_STRING),
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                'last_name': openapi.Schema(type=openapi.TYPE_STRING),
            }
        ),
        'office_hour': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                'course_name': openapi.Schema(type=openapi.TYPE_STRING),
                'section': openapi.Schema(type=openapi.TYPE_STRING),
                'day_of_week': openapi.Schema(type=openapi.TYPE_STRING),
                'start_time': openapi.Schema(type=openapi.TYPE_STRING),
                'end_time': openapi.Schema(type=openapi.TYPE_STRING),
                'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER),
                'room': openapi.Schema(type=openapi.TYPE_STRING),
                'status': openapi.Schema(type=openapi.TYPE_STRING),
            }
        ),
        'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', example='2025-12-01'),
        'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', example='14:30:00'),
        'is_cancelled': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
    }
)

# Schema for create booking response
create_booking_response = openapi.Response(
    description='Booking created successfully',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
            'booking_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
            'date': openapi.Schema(type=openapi.TYPE_STRING, example='2025-12-01'),
            'start_time': openapi.Schema(type=openapi.TYPE_STRING, example='14:30'),
            'message': openapi.Schema(type=openapi.TYPE_STRING, example='Successfully booked slot 1 on 2025-12-01 at 14:30.'),
        }
    )
)

# Schema for update booking response
update_booking_response = openapi.Response(
    description='Booking updated successfully',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
            'booking_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
            'message': openapi.Schema(type=openapi.TYPE_STRING, example='Booking updated successfully.'),
        }
    )
)

# Schema for cancel booking response
cancel_booking_response = openapi.Response(
    description='Booking cancelled successfully',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
            'booking_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
            'message': openapi.Schema(type=openapi.TYPE_STRING, example='Booking cancelled successfully.'),
        }
    )
)

# Schema for error responses
error_response_400 = openapi.Response(
    description='Bad request - validation error',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'error': openapi.Schema(
                type=openapi.TYPE_OBJECT,
                description='Field errors or general error message',
                example={'slot_id': ['This field is required.']}
            )
        }
    )
)

error_response_404 = openapi.Response(
    description='Booking not found',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'detail': openapi.Schema(type=openapi.TYPE_STRING, example='Not found.')
        }
    )
)

error_response_500 = openapi.Response(
    description='Internal server error',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'error': openapi.Schema(type=openapi.TYPE_STRING, example='An error occurred while creating the booking')
        }
    )
)
