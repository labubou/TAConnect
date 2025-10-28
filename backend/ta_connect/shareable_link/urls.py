from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .shareable_link import generate_shareable_link, view_shared_slots, revoke_link

urlpatterns = [
    path('shareable_link/generate/', generate_shareable_link, name='generate_shareable_link'),
    path('view/<uuid:link_id>/', view_shared_slots, name='view_shared_slots'),
    path('revoke/<uuid:link_id>/', revoke_link, name='revoke_link'),
]
