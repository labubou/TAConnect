from drf_yasg import openapi

confirm_booking_instructor_swagger = {
    'operation_description': 'Confirm a pending booking as an instructor. Sends confirmation email to the student.',
    'manual_parameters': [
        openapi.Parameter(
            'pk',
            openapi.IN_PATH,
            description='Booking ID to confirm',
            type=openapi.TYPE_INTEGER,
            required=True,
            example=1
        )
    ],
    'request_body': openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'send_email': openapi.Schema(
                type=openapi.TYPE_BOOLEAN,
                description='Whether to send confirmation email to the student',
                default=True,
                example=True
            ),
        },
        required=[]
    ),
    'responses': {
        200: openapi.Response(
            description='Booking confirmed successfully',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'success': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'booking_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example='Booking confirmed successfully.'),
                }
            )
        ),
        400: openapi.Response(
            description='Bad Request',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, example='Booking is already confirmed.'),
                }
            )
        ),
        404: openapi.Response(
            description='Not Found',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, example='Not found.'),
                }
            )
        ),
        500: 'Internal Server Error'
    }
}
