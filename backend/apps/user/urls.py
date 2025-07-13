# REST Framework Imports
from rest_framework.routers import DefaultRouter

# App Imports
from user.views import UserViewSet

router = DefaultRouter()
router.register(r"", UserViewSet, basename="user")

urlpatterns = router.urls
