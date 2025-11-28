from drf_yasg import openapi

# Response schemas
get_email_preferences_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(
            type=openapi.TYPE_INTEGER,
            description='User ID',
            example=1
        ),
        'username': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Username',
            example='john_doe'
        ),
        'email': openapi.Schema(
            type=openapi.TYPE_STRING,
            format='email',
            description='User email address',
            example='john.doe@university.edu'
        ),
        'user_type': openapi.Schema(
            type=openapi.TYPE_STRING,
            enum=['student', 'instructor'],
            description='Type of user',
            example='instructor'
        ),
        'email_on_booking': openapi.Schema(
            type=openapi.TYPE_BOOLEAN,
            description='Whether to send email notifications when a booking is made',
            example=True
        ),
        'email_on_cancellation': openapi.Schema(
            type=openapi.TYPE_BOOLEAN,
            description='Whether to send email notifications when a booking is cancelled',
            example=True
        ),
        'email_on_update': openapi.Schema(
            type=openapi.TYPE_BOOLEAN,
            description='Whether to send email notifications when a booking is updated',
            example=True
        ),
    },
)

# Request schemas
update_email_preferences_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'email_on_booking': openapi.Schema(
            type=openapi.TYPE_BOOLEAN,
            description='Enable/disable email notifications for new bookings',
            example=True
        ),
        'email_on_cancellation': openapi.Schema(
            type=openapi.TYPE_BOOLEAN,
            description='Enable/disable email notifications for booking cancellations',
            example=False
        ),
        'email_on_update': openapi.Schema(
            type=openapi.TYPE_BOOLEAN,
            description='Enable/disable email notifications for booking updates',
            example=True
        ),
    },
)

update_email_preferences_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'status': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Status message',
            example='Profile updated successfully'
        ),
        'error': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Error message if any'
        ),
    },
)

# Swagger decorator configurations
get_email_preferences_swagger = {
    'operation_description': '''
Get email notification preferences for the current authenticated user.

**For Instructors:**
- `email_on_booking`: Receive emails when students book office hours
- `email_on_cancellation`: Receive emails when students cancel bookings
- `email_on_update`: Receive emails when students update their bookings

**For Students:**
- `email_on_booking`: Receive emails when booking confirmation is sent
- `email_on_cancellation`: Receive emails when cancellation confirmation is sent
- `email_on_update`: Receive emails when booking update confirmation is sent

**Note:** User must be authenticated and have either an instructor or student profile.
    ''',
    'responses': {
        200: openapi.Response(
            description='Email preferences retrieved successfully',
            schema=get_email_preferences_response
        ),
        401: openapi.Response(
            description='Authentication required - User must be logged in'
        ),
        500: openapi.Response(
            description='Internal server error - Failed to retrieve preferences'
        )
    }
}

update_email_preferences_swagger = {
    'operation_description': '''
Update email notification preferences for the current authenticated user.

**Request Body Fields:**
- `email_on_booking`: Set to `true` to receive booking notifications, `false` to disable
- `email_on_cancellation`: Set to `true` to receive cancellation notifications, `false` to disable
- `email_on_update`: Set to `true` to receive booking update notifications, `false` to disable

**Behavior:**
- Only provided fields will be updated
- Changes take effect immediately
- Works for both instructor and student profiles

**Example Request:**
```json
{
  "email_on_booking": true,
  "email_on_cancellation": false,
  "email_on_update": true
}
```

**Use Cases:**
- Instructor wants to be notified of new bookings and updates but not cancellations
- Student wants to disable all email notifications
- User wants to enable only cancellation and update notifications
    ''',
    'request_body': update_email_preferences_request,
    'responses': {
        200: openapi.Response(
            description='Email preferences updated successfully',
            schema=update_email_preferences_response
        ),
        400: openapi.Response(
            description='Validation error - Invalid preference values provided'
        ),
        401: openapi.Response(
            description='Authentication required - User must be logged in'
        ),
        500: openapi.Response(
            description='Internal server error - Failed to update preferences'
        )
    }
}
