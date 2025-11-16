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
        'message': openapi.Schema(type=openapi.TYPE_STRING, description='Success message', example='Time slot updated successfully.'),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

delete_time_slot_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
        'time_slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the deleted time slot', example=1),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

update_status_time_slot_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
        'time_slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the time slot', example=1),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

# Swagger decorator configurations
create_time_slot_swagger = {
    'operation_description': "Create a new office hour time slot for the logged-in instructor.",
    'request_body': add_time_slot_request,
    'responses': {
        201: add_time_slot_response,
        400: "Invalid input data - missing required fields",
        500: "Internal server error - failed to create time slot"
    }
}

update_time_slot_swagger = {
    'operation_description': 'Update an existing office hour time slot for the logged-in instructor.',
    'manual_parameters': [
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the time slot to update',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    'request_body': update_time_slot_request,
    'responses': {
        200: update_time_slot_response,
        400: 'Validation error - missing required fields',
        404: 'Time slot not found',
        500: 'Internal server error - failed to update time slot',
    }
}

delete_time_slot_swagger = {
    'operation_description': 'Delete an existing office hour time slot for the logged-in instructor.',
    'manual_parameters': [
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the time slot to delete',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    'responses': {
        200: delete_time_slot_response,
        404: 'Time slot not found',
        500: 'Internal server error - failed to delete time slot',
    }
}
