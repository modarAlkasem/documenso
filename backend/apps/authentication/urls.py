# REST Framework Imports
from rest_framework.routers import DefaultRouter

# App Imports
from authentication.views import AuthViewSet, VerificationTokenViewSet

router = DefaultRouter()
router.register(r"", AuthViewSet, "auth")
router.register(r"verification-tokens", VerificationTokenViewSet, "verification-token")

urlpatterns = router.urls
