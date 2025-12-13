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
        'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Start date', example='2025-01-15'),
        'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='End date', example='2025-05-15'),
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
                        'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Start date', example='2025-01-15'),
                        'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='End date', example='2025-05-15'),
                        'room': openapi.Schema(type=openapi.TYPE_STRING, description='Room location', example='Tech Building Room 301'),
                        'status': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Slot active status', example=True),
                    }
                )
            ),
            'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if request fails'),
        }
    )
)

search_instructors_response = openapi.Response(
    description='List of matching instructors (matching query or all, in alphabetical order)',
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'instructors': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Instructor ID'),
                        'username': openapi.Schema(type=openapi.TYPE_STRING, description='Username'),
                        'full_name': openapi.Schema(type=openapi.TYPE_STRING, description='Full name'),
                        'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email'),
                    }
                )
            )
        }
    )
)

# Swagger decorator configurations
get_user_slots_swagger = {
    'operation_description': 'Get all office hour slots for the logged-in instructor.',
    'responses': {
        200: get_user_slots_response,
        500: 'Internal server error'
    }
}

get_user_bookings_swagger = {
    'operation_description': 'Get all bookings for the logged-in instructor. Optionally filter by date range and status.',
    'manual_parameters': [
        openapi.Parameter(
            'start_date',
            openapi.IN_QUERY,
            description='Start date for filtering bookings (YYYY-MM-DD). Optional.',
            type=openapi.TYPE_STRING,
            format='date',
            required=False,
            example='2025-01-01'
        ),
        openapi.Parameter(
            'end_date',
            openapi.IN_QUERY,
            description='End date for filtering bookings (YYYY-MM-DD). Optional.',
            type=openapi.TYPE_STRING,
            format='date',
            required=False,
            example='2025-01-31'
        ),
        openapi.Parameter(
            'status',
            openapi.IN_QUERY,
            description='Filter by booking status. Optional.',
            type=openapi.TYPE_STRING,
            enum=['pending', 'confirmed', 'completed', 'cancelled'],
            required=False,
            example='confirmed'
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
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER),
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
                                'is_completed': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                'status': openapi.Schema(type=openapi.TYPE_STRING),
                                'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                            }
                        )
                    )
                }
            )
        ),
        400: 'Bad Request - Invalid date format',
        500: 'Internal server error'
    }
}

search_instructors_swagger = {
    'operation_description': 'Search for instructors by name (first name, last name, or username).',
    'manual_parameters': [
        openapi.Parameter(
            'query',
            openapi.IN_QUERY,
            description='Search query for instructor name (optional)',
            type=openapi.TYPE_STRING,
            required=False
        )
    ],
    'responses': {
        200: search_instructors_response,
        500: 'Internal server error'
    }
}

get_instructor_data_swagger = {
    'operation_description': 'Get detailed information about a specific instructor including their office hour slots.',
    'manual_parameters': [
        openapi.Parameter(
            'user_id',
            openapi.IN_PATH,
            description='ID of the instructor',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    'responses': {
        200: get_instructor_data_response,
        404: 'Instructor not found',
        500: 'Internal server error'
    }
}