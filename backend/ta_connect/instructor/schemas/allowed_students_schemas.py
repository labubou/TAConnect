from drf_yasg import openapi

# Request schemas
add_allowed_student_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['email', 'id_number'],
    properties={
        'first_name': openapi.Schema(type=openapi.TYPE_STRING, description='Student first name', example='John'),
        'last_name': openapi.Schema(type=openapi.TYPE_STRING, description='Student last name', example='Doe'),
        'id_number': openapi.Schema(type=openapi.TYPE_STRING, description='Student ID number', example='12345678'),
        'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='Student email', example='john.doe@university.edu'),
    },
)

update_allowed_student_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'first_name': openapi.Schema(type=openapi.TYPE_STRING, description='Student first name', example='John'),
        'last_name': openapi.Schema(type=openapi.TYPE_STRING, description='Student last name', example='Doe'),
        'id_number': openapi.Schema(type=openapi.TYPE_STRING, description='Student ID number', example='12345678'),
        'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='Student email', example='john.doe@university.edu'),
    },
)

# Response schemas
allowed_student_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'first_name': openapi.Schema(type=openapi.TYPE_STRING, example='John'),
        'last_name': openapi.Schema(type=openapi.TYPE_STRING, example='Doe'),
        'id_number': openapi.Schema(type=openapi.TYPE_STRING, example='12345678'),
        'email': openapi.Schema(type=openapi.TYPE_STRING, example='john.doe@university.edu'),
    },
)

add_allowed_student_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
        'allowed_students_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

get_allowed_students_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'allowed_students': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=allowed_student_response,
            description='List of allowed students for the slot'
        )
    },
)

update_allowed_student_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
        'time_slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the updated allowed student', example=1),
        'message': openapi.Schema(type=openapi.TYPE_STRING, example='Time slot updated successfully.'),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

delete_allowed_student_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
        'allowed_student_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

update_allowed_students_status_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
        'time_slot_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the office hour slot', example=1),
        'require_specific_email': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Current status of email requirement', example=True),
        'message': openapi.Schema(type=openapi.TYPE_STRING, example='Email requirement status updated successfully.'),
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message if any'),
    },
)

# Swagger decorator configurations
add_allowed_student_swagger = {
    'operation_description': 'Add an allowed student to an office hour slot with specific booking policies.',
    'manual_parameters': [
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the office hour slot',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    'request_body': add_allowed_student_request,
    'responses': {
        201: add_allowed_student_response,
        400: 'Validation error - invalid email or ID number',
        404: 'Slot not found',
        500: 'Internal server error'
    }
}

get_allowed_students_swagger = {
    'operation_description': 'Retrieve all allowed students for a specific office hour slot.',
    'manual_parameters': [
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the office hour slot',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    'responses': {
        200: get_allowed_students_response,
        400: 'Bad Request - Slot ID is required',
        404: 'Slot not found',
        500: 'Internal server error'
    }
}

update_allowed_student_swagger = {
    'operation_description': 'Update an existing allowed student record.',
    'manual_parameters': [
        openapi.Parameter(
            'allowed_student_id',
            openapi.IN_PATH,
            description='ID of the allowed student to update',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    'request_body': update_allowed_student_request,
    'responses': {
        200: update_allowed_student_response,
        400: 'Validation error',
        404: 'Allowed student not found',
        500: 'Internal server error'
    }
}

delete_allowed_student_swagger = {
    'operation_description': 'Delete an allowed student record from a slot.',
    'manual_parameters': [
        openapi.Parameter(
            'allowed_student_id',
            openapi.IN_PATH,
            description='ID of the allowed student to delete',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    'responses': {
        200: delete_allowed_student_response,
        404: 'Allowed student not found',
        500: 'Internal server error'
    }
}

update_allowed_students_status_swagger = {
    'operation_description': 'Toggle the email requirement status for allowed students on an office hour slot.',
    'manual_parameters': [
        openapi.Parameter(
            'slot_id',
            openapi.IN_PATH,
            description='ID of the office hour slot',
            type=openapi.TYPE_INTEGER,
            required=True
        )
    ],
    'responses': {
        200: update_allowed_students_status_response,
        400: 'Bad Request - Slot ID is required',
        404: 'Slot not found',
        500: 'Internal server error'
    }
}
