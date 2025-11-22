from drf_yasg import openapi

# Response schemas
book_slot_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Booking ID'),
        'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='OfficeHourSlot ID'),
        'date_str': openapi.Schema(type=openapi.TYPE_STRING, description='Booking date'),
        'start_time_str': openapi.Schema(type=openapi.TYPE_STRING, description='Start time'),
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
    },
    required=['slot_id', 'date_str', 'start_time_str']
)

# Swagger configurations
create_booking_swagger = {
    'operation_description': 'Create a new booking for a given office hour slot.',
    'request_body': create_booking_request,
    'responses': {
        201: book_slot_response,
        400: 'Bad Request',
        500: 'Internal Server Error'
    }
}

update_booking_swagger = {
    'operation_description': "Update an existing booking's date and time.",
    'manual_parameters': [
        openapi.Parameter('pk', openapi.IN_PATH, description='Booking ID', type=openapi.TYPE_INTEGER, required=True)
    ],
    'request_body': update_booked_slot_request,
    'responses': {
        200: update_booked_slot_response,
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
    'responses': {
        200: cancel_booked_slot_response,
        400: 'Bad Request',
        404: 'Not Found',
        500: 'Internal Server Error'
    }
}

# Available Times Schemas
available_times_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Date to check availability (YYYY-MM-DD)', example='2025-12-01'),
    },
    required=['date']
)

available_times_response = openapi.Response(
    description='Available times retrieved successfully',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
            'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', example='2025-12-01'),
            'available_times': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(type=openapi.TYPE_STRING, format='time', example='14:30'),
                description='List of available start times'
            ),
        }
    )
)

available_times_swagger = {
    'operation_description': 'Get available times for a specific office hour slot on a given date.',
    'manual_parameters': [
        # Removed 'pk' parameter as it is automatically detected from the URL
        openapi.Parameter(
            'date', 
            openapi.IN_QUERY, 
            description='Date to check availability (YYYY-MM-DD)', 
            type=openapi.TYPE_STRING, 
            format='date', 
            required=True
        )
    ],
    'responses': {
        200: available_times_response,
        400: 'Bad Request',
        404: 'Slot Not Found',
        500: 'Internal Server Error'
    }
}
