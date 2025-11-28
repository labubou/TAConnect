from drf_yasg import openapi

export_bookings_csv_params = [
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
    )
]
