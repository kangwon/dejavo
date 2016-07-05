from django.contrib.auth.backends import ModelBackend
# from django.contrib.auth.models import User
from dejavo.apps.account.models import ZaboUser

class PasswordlessModelBackend(ModelBackend):
    def authenticate(self, username=None):
        try:
            user = ZaboUser.objects.get(sid=username)
            if user.is_staff or user.is_superuser:
                return None
            return user
        except ZaboUser.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return ZaboUser.objects.get(pk=user_id)
        except ZaboUser.DoesNotExist:
            return None