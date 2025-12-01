from drf_yasg import openapi

# Request schema for delete account
delete_account_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['password'],
    properties={
        'password': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Current password to confirm account deletion',
            example='MyPassword123'
        ),
    }
)

# Response schemas
delete_account_success_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'message': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Success message',
            example='User deleted successfully.'
        ),
    }
)

delete_account_success_partial_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'message': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Success message with email notification warning',
            example='User Deleted successfully. However, we could not send the account deletion email notification.'
        ),
    }
)

delete_account_error_response = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'error': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Error message',
            example='Invalid password.'
        ),
    }
)

# Swagger responses dictionary
delete_account_responses = {
    200: openapi.Response(
        description='Account deleted successfully',
        schema=delete_account_success_response
    ),
    400: openapi.Response(
        description='Bad request - Invalid password or validation error',
        schema=delete_account_error_response
    ),
    401: openapi.Response(
        description='Unauthorized - Authentication required',
        schema=delete_account_error_response
    ),
    429: openapi.Response(
        description='Too many requests'
    ),
    500: openapi.Response(
        description='Internal server error',
        schema=delete_account_error_response
    ),
}
