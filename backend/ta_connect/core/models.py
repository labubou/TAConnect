from django.db import models
from django.utils import timezone
import uuid

# Create your models here.
class TimeStampedModel(models.Model):
    """
    Abstract base model that provides self-updating
    'created_at' and 'updated_at' fields.
    
    Usage:
        class MyModel(TimeStampedModel):
            name = models.CharField(max_length=100)
    """
    created_at = models.DateTimeField(
        default=timezone.now,
        editable=False,
        help_text="Timestamp when the record was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the record was last updated"
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        """Update the updated_at timestamp on every save."""
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

class BaseModel(TimeStampedModel):
    """
    The standard base model for TAConnect.
    Includes timestamps by default.
    
    Usage:
        class MyModel(BaseModel):
            name = models.CharField(max_length=100)
    """

    class Meta:
        abstract = True