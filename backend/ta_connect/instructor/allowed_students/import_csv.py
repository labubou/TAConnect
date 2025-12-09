from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from accounts.permissions import IsInstructor
from instructor.models import OfficeHourSlot
from instructor.serializers.csv_files_serializer import CSVUploadSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class CSVUploadView(GenericAPIView):
    permission_classes = [IsInstructor]
    serializer_class = CSVUploadSerializer
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('slot_id', openapi.IN_PATH, description='Office Hour Slot ID', type=openapi.TYPE_INTEGER),
        ],
        request_body=CSVUploadSerializer,
        responses={
            201: openapi.Response('CSV processed successfully'),
            400: openapi.Response('Invalid file format or validation error'),
            404: openapi.Response('Slot not found'),
            413: openapi.Response('File too large'),
            500: openapi.Response('Internal server error')
        }
    )
    def post(self, request, slot_id):
        slot = OfficeHourSlot.objects.get(id=slot_id)

        if not slot:
            return Response({'error': 'Office hour slot not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CSVUploadSerializer(data=request.FILES, context={'slot': slot})

        if serializer.is_valid():
            try:
                created_users, errors = serializer.process_csv()
                return Response({
                    'message': 'CSV processed successfully',
                    'created_users': created_users,
                    'errors': errors
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"Error processing CSV: {str(e)}")
                return Response({"error": "An error occurred while processing the CSV file."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
