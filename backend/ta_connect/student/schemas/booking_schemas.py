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
