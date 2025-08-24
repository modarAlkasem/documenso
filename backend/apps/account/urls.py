# REST Framework Imports
from rest_framework.routers import DefaultRouter

# App Imports
from account.views import AccountViewSet

router = DefaultRouter()
router.register(r"", AccountViewSet, "account")


urlpatterns = router.urls
