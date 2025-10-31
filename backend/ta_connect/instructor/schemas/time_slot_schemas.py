from drf_yasg import openapi

add_time_slot_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['course_name', 'day_of_week', 'start_time', 'end_time', 'start_date', 'end_date', 'room'],
    properties={
        'course_name': openapi.Schema(type=openapi.TYPE_STRING, description='Name of the course', example='Computer Science 101'),
        'section': openapi.Schema(type=openapi.TYPE_STRING, description='Section identifier (optional)', example='A1'),
        'day_of_week': openapi.Schema(
            type=openapi.TYPE_STRING, 
            description='Day of the week',
            enum=['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            example='Mon'
        ),
        'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='Start time of office hours', example='14:00:00'),
        'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='End time of office hours', example='16:00:00'),
        'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER, description='Duration of each booking slot in minutes', example=10, default=10),
        'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Start date of office hours', example='2024-01-15'),
        'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='End date of office hours', example='2024-05-15'),
        'room': openapi.Schema(type=openapi.TYPE_STRING, description='Room location for office hours', example='Building A, Room 101'),
        'set_student_limit': openapi.Schema(type=openapi.TYPE_INTEGER, description='Maximum number of students per booking slot', example=1, default=1),
    },
)

add_time_slot_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
        'time_slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the created time slot', example=1),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

update_time_slot_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['course_name', 'day_of_week', 'start_time', 'end_time', 'start_date', 'end_date', 'room'],
    properties={
        'course_name': openapi.Schema(type=openapi.TYPE_STRING, description='Name of the course', example='Computer Science 101'),
        'section': openapi.Schema(type=openapi.TYPE_STRING, description='Section identifier (optional)', example='A1'),
        'day_of_week': openapi.Schema(
            type=openapi.TYPE_STRING, 
            description='Day of the week',
            enum=['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            example='Mon'
        ),
        'start_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='Start time of office hours', example='14:00:00'),
        'end_time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='End time of office hours', example='16:00:00'),
        'duration_minutes': openapi.Schema(type=openapi.TYPE_INTEGER, description='Duration of each booking slot in minutes', example=10, default=10),
        'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Start date of office hours', example='2024-01-15'),
        'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='End date of office hours', example='2024-05-15'),
        'room': openapi.Schema(type=openapi.TYPE_STRING, description='Room location for office hours', example='Building A, Room 101'),
        'set_student_limit': openapi.Schema(type=openapi.TYPE_INTEGER, description='Maximum number of students per booking slot', example=1, default=1),
    },
)

update_time_slot_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
        'time_slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the updated time slot', example=1),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)
