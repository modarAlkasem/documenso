# Python Imports
from uuid import UUID

# REST Framework Imports
from rest_framework.viewsets import ViewSet
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import action

# App Imports
from user.services.user_service import UserService


class UserViewSet(ViewSet):
    service = UserService()

    def retrieve(self, request: Request, pk: UUID) -> Response:
        return self.service.retrieve(request, pk)

    @action(detail=True, url_path="with-recent-token")
    def retrieve_with_recent_token(self, request: Request, pk: UUID) -> Response:
        return self.service.retrieve_with_recent_token(request, pk)


class UnauthUserViewSet(ViewSet):
    service = UserService()

    def partial_update(self, request: Request, pk: int) -> Response:
        return self.service.unauth_partial_update(request, pk)

    @action(detail=False, url_path="retrieve")
    def retrieve_by_unique_field(self, request: Request) -> Response:
        return self.service.retrieve_by_unique_field(request)
