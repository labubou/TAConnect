from drf_yasg import openapi

url_data_slots_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Slot ID', example=1),
        'instructor': openapi.Schema(type=openapi.TYPE_STRING, description='Instructor username', example='john_doe'),
        'course_name': openapi.Schema(type=openapi.TYPE_STRING, description='Course name', example='Computer Science 101'),
        'section': openapi.Schema(type=openapi.TYPE_STRING, description='Section identifier', example='A1'),
        'day_of_week': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Day of the week',
            enum=['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            example='Mon'
        ),
        'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='Start time', example='14:00:00'),
        'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='End time', example='16:00:00'),
        'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER, description='Duration in minutes', example=10),
        'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Start date', example='2024-01-15'),
        'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='End date', example='2024-05-15'),
        'room': openapi.Schema(type=openapi.TYPE_STRING, description='Room location', example='Tech Building Room 301'),
        'status': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Slot active status', example=True),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

get_user_slots_response = openapi.Response(
    description='List of instructor office hour slots',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'slots': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Slot ID', example=1),
                        'course_name': openapi.Schema(type=openapi.TYPE_STRING, description='Course name', example='Computer Science 101'),
                        'section': openapi.Schema(type=openapi.TYPE_STRING, description='Section identifier', example='A1'),
                        'day_of_week': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Day of the week',
                            enum=['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            example='Mon'
                        ),
                        'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='Start time', example='14:00:00'),
                        'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='End time', example='16:00:00'),
                        'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER, description='Duration in minutes', example=10),
                        'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Start date', example='2024-01-15'),
                        'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='End date', example='2024-05-15'),
                        'room': openapi.Schema(type=openapi.TYPE_STRING, description='Room location', example='Tech Building Room 301'),
                        'status': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Slot active status', example=True),
                        'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time', description='Creation timestamp', example='2024-01-10T10:30:00Z'),
                        'require_specific_email': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Whether specific email is required', example=False),
                        'set_student_limit': openapi.Schema(type=openapi.TYPE_INTEGER, description='Maximum students per slot', example=1),
                    }
                )
            )
        }
    )
)