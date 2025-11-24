from rest_framework import serializers
from instructor.models import OfficeHourSlot, AllowedStudents
import csv
from io import TextIOWrapper
import re
from django.core.exceptions import ValidationError as DjangoValidationError

class CSVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    # Security constants
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_ROWS = 1000
    ALLOWED_EXTENSIONS = ['csv']
    
    # Expected CSV columns
    REQUIRED_COLUMNS = {'First name', 'Last name', 'ID number', 'Email address'}
    
    def validate_file(self, value):
        """Validate file format, size, and encoding"""
        # Check file extension
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("File must be in CSV format (.csv)")
        
        # Check file size
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"File size exceeds maximum allowed size of {self.MAX_FILE_SIZE / (1024*1024):.1f}MB"
            )
        
        # Check file size is not empty
        if value.size == 0:
            raise serializers.ValidationError("File is empty")
        
        return value
    
    def _sanitize_text(self, text):
        """Sanitize text input to prevent injection attacks"""
        if not isinstance(text, str):
            return text
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        # Limit length to prevent DOS
        text = text[:500]
        
        # Remove potentially dangerous characters but allow common names
        # Allow letters, numbers, spaces, hyphens, apostrophes, periods
        sanitized = re.sub(r'[^\w\s\'-.]', '', text, flags=re.UNICODE)
        
        return sanitized
    
    def _validate_email(self, email):
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise ValueError(f"Invalid email format: {email}")
        return email.lower()  # Normalize to lowercase
    
    def _validate_id_number(self, id_number):
        """Validate ID number format"""
        # Allow alphanumeric with hyphens/underscores, 3-50 chars
        if not re.match(r'^[a-zA-Z0-9_-]{3,50}$', id_number):
            raise ValueError(f"Invalid ID format: {id_number}")
        return id_number
    
    def process_csv(self):
        csv_file = self.validated_data['file']
        file_wrapper = TextIOWrapper(csv_file.file, encoding='utf-8')
        csv_reader = csv.DictReader(file_wrapper)
        
        created_users = []
        errors = []
        
        slot = self.context.get('slot')
        policy = slot.policy

        for row_num, row in enumerate(csv_reader, start=2):
            try:
                first_name = row.get('First name', '').strip()
                last_name = row.get('Last name', '').strip()
                id_number = row.get('ID number', '').strip()
                email = row.get('Email address', '').strip()
                
                if not all([first_name, last_name, id_number, email]):
                    errors.append(f"Row {row_num}: Missing required fields")
                    continue
                
                # Create AllowedStudent
                allowed_student, created = AllowedStudents.objects.get_or_create(
                    booking_policy=policy,
                    email=email,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'id_number': id_number,
                    }
                )
                
                if created:
                    created_users.append({
                        'first_name': first_name,
                        'last_name': last_name,
                        'id_number': id_number,
                        'email': email,
                    })
                else:
                    errors.append(f"Row {row_num}: Email {email} already exists for this policy")
                
                if not policy.require_specific_email:
                    policy.require_specific_email = True
                    policy.save()

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        return created_users, errors