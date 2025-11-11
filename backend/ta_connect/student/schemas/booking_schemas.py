from drf_yasg import openapi

book_slot_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['date', 'time'],
    properties={
        'date': openapi.Schema(
            type=openapi.TYPE_STRING,
            format='date',
            description='Date in YYYY-MM-DD format',
            example='2024-01-15'
        ),
        'time': openapi.Schema(
            type=openapi.TYPE_STRING,
            format='time',
            description='Start time in HH:MM format',
            example='14:00'
        ),
    },
)

book_slot_response = openapi.Response(
    description='Slot booked successfully',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the booked slot', example=1),
            'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Booking date', example='2024-01-15'),
            'start_time': openapi.Schema(type=openapi.TYPE_STRING, description='Booking start time', example='14:00'),
            'message': openapi.Schema(type=openapi.TYPE_STRING, description='Success message', example='Successfully booked slot 1 on 2024-01-15 at 14:00.'),
        }
    )
)

update_booked_slot_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['new_date', 'new_time'],
    properties={
        'new_date': openapi.Schema(
            type=openapi.TYPE_STRING,
            format='date',
            description='New booking date in YYYY-MM-DD format (must be today or in the future)',
            example='2024-01-16'
        ),
        'new_time': openapi.Schema(
            type=openapi.TYPE_STRING,
            format='time',
            description='New booking time in HH:MM format (must be in the future if date is today)',
            example='15:00'
        ),
    },
)

update_booked_slot_response = openapi.Response(
    description='Booking updated successfully',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
            'booking_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the updated booking', example=1),
            'new_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='New booking date', example='2024-01-16'),
            'new_time': openapi.Schema(type=openapi.TYPE_STRING, description='New booking time', example='15:00'),
            'message': openapi.Schema(type=openapi.TYPE_STRING, description='Success message', example='Successfully updated booking to 2024-01-16 at 15:00.'),
        }
    )
)

cancel_booked_slot_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={},
    description='No request body required - booking ID is provided in the URL path'
)

cancel_booked_slot_response = openapi.Response(
    description='Booking cancelled successfully',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
            'message': openapi.Schema(type=openapi.TYPE_STRING, description='Success message', example='Successfully cancelled booking for Computer Science 101 on January 15, 2024 at 02:00 PM.'),
        }
    )
)

book_slot_manual_parameters = [
    openapi.Parameter(
        'slot_id',
        openapi.IN_PATH,
        description='ID of the office hour slot',
        type=openapi.TYPE_INTEGER,
        required=True
    )
]

book_slot_responses = {
    200: book_slot_response,
    400: 'Invalid request or slot not active',
    403: 'Student email not allowed to book this slot or booking limit reached',
    404: 'Slot not found',
    500: 'Internal server error'
}
