from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class ShareableLink(models.Model):
    ACCESS_CHOICES = [
        ('PUBLIC', 'Public Access'),
        ('SECTION', 'Section Students Only'),
        ('ENROLLED', 'Enrolled Students Only'),
        ('PRIVATE', 'Private - Specific Students')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_links')
    course_name = models.CharField(max_length=100)
    section = models.CharField(max_length=50, blank=True)
    access_type = models.CharField(max_length=20, choices=ACCESS_CHOICES, default='PUBLIC')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    allowed_users = models.ManyToManyField(User, related_name='accessible_links', blank=True)
    current_uses = models.IntegerField(default=0)

    def is_valid(self):
        """Check if the link is still valid"""
        if not self.is_active:
            return False
        return True

    def can_access(self, user=None):
        """Check if a user can access this link"""
        if not self.is_valid():
            return False
            
        if self.access_type == 'PUBLIC':
            return True
        if not user:
            return False
            
        if self.access_type == 'PRIVATE':
            return self.allowed_users.filter(id=user.id).exists()
            
        if self.access_type == 'SECTION':
            # Assuming there's a StudentSection model that tracks section enrollment
            return user.student_sections.filter(
                course_name=self.course_name,
                section=self.section
            ).exists()
            
        if self.access_type == 'ENROLLED':
            # Assuming there's a StudentEnrollment model
            return user.enrollments.filter(course_name=self.course_name).exists()
            
        return False

    def revoke(self):
        """Revoke access to this link"""
        self.is_active = False
        self.save()
