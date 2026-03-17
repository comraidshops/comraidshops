from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Authenticates against settings.AUTH_USER_MODEL.
    Allows login with either username or email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        if not username:
            return None

        # Try to fetch user by username or email
        # We use .filter().first() to avoid MultipleObjectsReturned if emails aren't unique
        # We also exclude empty strings to avoid matching users with no email
        user_qs = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username))
        
        # Priority: Exact username match if exists
        user = user_qs.filter(username__iexact=username).first()
        if not user:
            user = user_qs.first()

        if user:
            if user.check_password(password):
                if self.user_can_authenticate(user):
                    return user
        
        # Fallback to default check (to ensure hasher runs)
        User().set_password(password)
        return None
