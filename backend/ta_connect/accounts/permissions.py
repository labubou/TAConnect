from rest_framework import permissions

class IsInstructor(permissions.BasePermission):
    """
    Permission class to allow only instructors.
    """
    message = "You must be an instructor to access this resource."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_instructor()

class IsStudent(permissions.BasePermission):
    """
    Permission class to allow only students.
    """
    message = "You must be a student to access this resource."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student()

#! won't be used but just in case
class IsInstructorOrStudent(permissions.BasePermission):
    """
    Permission class to allow both instructors and students.
    Essentially any authenticated user.
    """
    message = "You must be authenticated to access this resource."

    def has_permission(self, request, view):
        return request.user.is_authenticated
