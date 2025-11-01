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

get_user_slots_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'slots': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'course_name': openapi.Schema(type=openapi.TYPE_STRING),
                    'section': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                    'day_of_week': openapi.Schema(type=openapi.TYPE_STRING),
                    'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time'),
                    'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='time'),
                    'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                    'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                    'room': openapi.Schema(type=openapi.TYPE_STRING),
                    'status': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                    'require_specific_email': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'set_student_limit': openapi.Schema(type=openapi.TYPE_INTEGER, nullable=True),
                }
            )
        ),
        'bookings': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'student': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'username': openapi.Schema(type=openapi.TYPE_STRING),
                            'email': openapi.Schema(type=openapi.TYPE_STRING, format='email'),
                            'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                            'last_name': openapi.Schema(type=openapi.TYPE_STRING),
                        }
                    ),
                    'office_hour': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'course_name': openapi.Schema(type=openapi.TYPE_STRING),
                            'section': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                            'day_of_week': openapi.Schema(type=openapi.TYPE_STRING),
                            'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time'),
                            'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='time'),
                            'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'room': openapi.Schema(type=openapi.TYPE_STRING),
                            'status': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        }
                    ),
                    'date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                    'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                    'is_cancelled': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                }
            )
        ),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if request fails'),
    },
    description='Response containing office hour slots and their associated bookings'
)

get_instructor_data_response = openapi.Response(
    description='Detailed information about a specific instructor including their office hour slots',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Instructor ID', example=1),
            'username': openapi.Schema(type=openapi.TYPE_STRING, description='Username', example='john_doe'),
            'full_name': openapi.Schema(type=openapi.TYPE_STRING, description='Full name', example='John Doe'),
            'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email', example='john.doe@example.com'),
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
                    }
                )
            ),
            'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if request fails'),
        }
    )
)