"""
URL configuration for ta_connect project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import redirect
from ta_connect.settings import frontend_url
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

# Define the schema view for Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="TA Connect API",
        default_version='v1',
        description="""
# TA Connect API Documentation

## Authentication
This API uses JWT (JSON Web Token) authentication. To access protected endpoints:

1. **Obtain tokens**: POST to `/api/auth/login/` with your credentials
2. **Use the access token**: Click the "Authorize" button (🔓) at the top right
3. **Enter**: `Bearer <your_access_token>` (note the space after "Bearer")
4. **Example**: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

## Token Refresh
- Access tokens expire after 60 minutes
- Refresh tokens expire after 30 days
- Refresh your token using POST `/api/auth/token/refresh/`

## Endpoints
All endpoints requiring authentication are marked with a 🔒 icon.
        """,
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="taconnect.team@gmail.com"),
        license=openapi.License(name="Dual License: AGPL-3.0 / Commercial"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
    authentication_classes=[JWTAuthentication],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/instructor/', include('instructor.urls')),
    path('api/student/', include('student.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'), 
]
