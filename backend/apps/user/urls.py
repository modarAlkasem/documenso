# REST Framework Imports
from rest_framework.routers import DefaultRouter

# App Imports
from user.views import UserViewSet, UnauthUserViewSet

router = DefaultRouter()
router.register(r"", UserViewSet, basename="user")
router.register(r"unauth", UnauthUserViewSet, basename="unauth-user")

urlpatterns = router.urls
