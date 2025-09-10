# REST Framework Imports
from rest_framework.routers import DefaultRouter

# App Imports
from authentication.views import (
    AuthViewSet,
    VerificationTokenViewSet,
    SecurityLogViewSet,
    PasswordResetTokeniewSet,
)

router = DefaultRouter()
router.register(r"", AuthViewSet, "auth")
router.register(r"verification-tokens", VerificationTokenViewSet, "verification-token")
router.register(r"security-logs", SecurityLogViewSet, "security-log")
router.register(
    r"password-reset-tokens", PasswordResetTokeniewSet, "password-reset-token"
)

urlpatterns = router.urls
