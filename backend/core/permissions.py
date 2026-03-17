from rest_framework import permissions

class IsApprovedVendor(permissions.BasePermission):
    """
    Allows access only to authenticated users who are vendors and approved.
    """
    message = "You must be an approved vendor to perform this action."

    def has_permission(self, request, view):
        # User must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Check existing vendor flag
        if not getattr(request.user, 'is_vendor', False):
            return False

        # Check approval flag
        if not getattr(request.user, 'is_vendor_approved', False):
            return False

        return True

class IsVendorUser(permissions.BasePermission):
    """
    Allows access only to authenticated users who have a vendor profile.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, "vendor_profile")
