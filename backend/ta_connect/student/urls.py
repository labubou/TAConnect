from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import url_data_slots

urlpatterns = [
    path('url/<int:slot_id>/', url_data_slots, name='url_data_slots'),
    
    
    

]
