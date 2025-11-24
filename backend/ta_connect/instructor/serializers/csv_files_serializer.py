from rest_framework import serializers
from instructor.models import OfficeHourSlot, AllowedStudents
import csv
from io import TextIOWrapper

class CSVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, value):
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("File must be in CSV format")
        return value
    
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