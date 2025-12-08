from drf_yasg import openapi

# Response schemas
book_slot_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Booking ID'),
        'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='OfficeHourSlot ID'),
        'date_str': openapi.Schema(type=openapi.TYPE_STRING, description='Booking date'),
        'start_time_str': openapi.Schema(type=openapi.TYPE_STRING, description='Start time'),
        'book_description': openapi.Schema(type=openapi.TYPE_STRING, description='Optional description or notes for the booking'),
    }
)

update_booked_slot_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'date_str': openapi.Schema(type=openapi.TYPE_STRING, description='New booking date in YYYY-MM-DD format'),
        'start_time_str': openapi.Schema(type=openapi.TYPE_STRING, description='New start time in HH:MM format'),
    }
)

update_booked_slot_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Booking ID'),
        'date_str': openapi.Schema(type=openapi.TYPE_STRING, description='Updated booking date'),
        'start_time_str': openapi.Schema(type=openapi.TYPE_STRING, description='Updated start time'),
    }
)

cancel_booked_slot_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'message': openapi.Schema(type=openapi.TYPE_STRING, description='Cancellation confirmation message'),
    }
)

# Schema matching the CreateBookingSerializer fields
create_booking_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='OfficeHourSlot ID', example=1),
        'date_str': openapi.Schema(type=openapi.TYPE_STRING, description='Booking date in YYYY-MM-DD format', example='2025-12-01'),
        'start_time_str': openapi.Schema(type=openapi.TYPE_STRING, description='Start time in HH:MM format', example='14:30'),
        'book_description': openapi.Schema(type=openapi.TYPE_STRING, description='Optional description or notes for the booking', example='Need help with assignment 3'),
    },
    required=['slot_id', 'date_str', 'start_time_str']
)

# Swagger configurations
create_booking_swagger = {
    'operation_description': 'Create a new booking for a given office hour slot.',
    'request_body': openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='OfficeHourSlot ID', example=1),
            'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Booking date in YYYY-MM-DD format', example='2025-12-01'),
            'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='Start time in HH:MM format', example='14:30'),
            'book_description': openapi.Schema(type=openapi.TYPE_STRING, description='Optional description or notes for the booking (max 500 characters)', example='Need help with assignment 3'),
        },
        required=['slot_id', 'date', 'start_time']
    ),
    'responses': {
        201: openapi.Response(
            description='Booking created successfully',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'booking_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', example='2025-12-01'),
                    'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', example='14:30:00'),
                    'book_description': openapi.Schema(type=openapi.TYPE_STRING, example='Need help with assignment 3'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example='Successfully booked slot 1 on 2025-12-01 at 14:30:00.'),
                }
            )
        ),
        400: 'Bad Request',
        500: 'Internal Server Error'
    }
}

get_bookings_swagger = {
    'operation_description': 'Get all bookings for the current student. Optionally filter by date range. If no dates provided, defaults to current month.',
    'manual_parameters': [
        openapi.Parameter(
            'date_from',
            openapi.IN_QUERY,
            description='Start date for filtering bookings (YYYY-MM-DD). Optional. Defaults to first day of current month.',
            type=openapi.TYPE_STRING,
            format='date',
            required=False,
            example='2025-11-01'
        ),
        openapi.Parameter(
            'date_to',
            openapi.IN_QUERY,
            description='End date for filtering bookings (YYYY-MM-DD). Optional. Defaults to last day of current month.',
            type=openapi.TYPE_STRING,
            format='date',
            required=False,
            example='2025-11-30'
        )
    ],
    'responses': {
        200: openapi.Response(
            description='Bookings retrieved successfully',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'bookings': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                                'instructor': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'id': openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
                                        'full_name': openapi.Schema(type=openapi.TYPE_STRING, example='John Doe'),
                                        'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', example='john.doe@example.com'),
                                    }
                                ),
                                'course_name': openapi.Schema(type=openapi.TYPE_STRING, example='Computer Science 101'),
                                'section': openapi.Schema(type=openapi.TYPE_STRING, nullable=True, example='A1'),
                                'room': openapi.Schema(type=openapi.TYPE_STRING, example='Tech Building Room 301'),
                                'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', example='2025-11-24'),
                                'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='date-time', example='2025-11-24T14:00:00Z'),
                                'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='date-time', example='2025-11-24T14:20:00Z'),
                                'book_description': openapi.Schema(type=openapi.TYPE_STRING, nullable=True, example='Need help with assignment 3'),
                                'is_cancelled': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=False),
                                'is_completed': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                                'status': openapi.Schema(type=openapi.TYPE_STRING, example='completed'),
                            }
                        )
                    )
                }
            )
        ),
        500: 'Internal Server Error'
    }
}

update_booking_swagger = {
    'operation_description': "Update an existing booking's date and time.",
    'manual_parameters': [
        openapi.Parameter('pk', openapi.IN_PATH, description='Booking ID', type=openapi.TYPE_INTEGER, required=True)
    ],
    'request_body': openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'new_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='New booking date in YYYY-MM-DD format', example='2025-12-01'),
            'new_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='New start time in HH:MM format', example='14:30'),
        },
        required=['new_date', 'new_time']
    ),
    'responses': {
        200: openapi.Response(
            description='Booking updated successfully',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'booking_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example='Booking updated successfully.'),
                }
            )
        ),
        400: 'Bad Request',
        404: 'Not Found',
        500: 'Internal Server Error'
    }
}

cancel_booking_swagger = {
    'operation_description': 'Cancel an existing booking.',
    'manual_parameters': [
        openapi.Parameter('pk', openapi.IN_PATH, description='Booking ID', type=openapi.TYPE_INTEGER, required=True)
    ],
    'request_body': openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'confirm': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Confirm cancellation', example=True, default=True),
        }
    ),
    'responses': {
        200: openapi.Response(
            description='Booking cancelled successfully',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'booking_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example='Booking cancelled successfully.'),
                }
            )
        ),
        400: 'Bad Request',
        404: 'Not Found',
        500: 'Internal Server Error'
    }
}

available_times_swagger = {
    'operation_description': 'Get available times for a specific office hour slot on a given date.',
    'manual_parameters': [
        openapi.Parameter(
            'date', 
            openapi.IN_QUERY, 
            description='Date to check availability (YYYY-MM-DD)', 
            type=openapi.TYPE_STRING, 
            format='date', 
            required=True,
            example='2025-12-01'
        )
    ],
    'responses': {
        200: openapi.Response(
            description='Available times retrieved successfully',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', example='2025-12-01'),
                    'available_times': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_STRING, format='time', example='14:30:00'),
                        description='List of available start times'
                    ),
                }
            )
        ),
        400: 'Bad Request',
        404: 'Slot Not Found',
        500: 'Internal Server Error'
    }
}
