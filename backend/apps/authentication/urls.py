# REST Framework Imports
from rest_framework.routers import DefaultRouter

# App Imports
from authentication.views import AuthViewSet

router = DefaultRouter()
router.register(r"", AuthViewSet, "auth")

urlpatterns = router.urls
