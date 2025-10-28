from django.contrib import admin
from .models import ShareableLink

@admin.register(ShareableLink)
class ShareableLinkAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'instructor',
        'course_name',
        'section',
        'access_type',
        'is_active',
        'created_at',
        'allowed_users',
        'current_uses',
    )
    list_filter = ('access_type', 'is_active', 'created_at', 'instructor')
    search_fields = ('course_name', 'section', 'instructor__username', 'id')
    readonly_fields = ('id', 'created_at', 'current_uses')
    filter_horizontal = ('allowed_users',)
    actions = ['revoke_links', 'activate_links']

    def get_allowed_users(self, obj):
        return ", ".join([user.username for user in obj.allowed_users.all()])
    get_allowed_users.short_description = 'Allowed Users'

    def revoke_links(self, request, queryset):
        queryset.update(is_active=False)
    revoke_links.short_description = "Revoke selected links"

    def activate_links(self, request, queryset):
        queryset.update(is_active=True)
    activate_links.short_description = "Activate selected links"
