# REST Framework Imports
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request

# App Imports
from .services import AuthService, VerificationTokenService, SecurityLogService


class AuthViewSet(ViewSet):
    service = AuthService()

    @action(methods=["POST"], detail=False)
    def signup(self, request: Request) -> Response:
        return self.service.sign_up(request)


class VerificationTokenViewSet(ViewSet):
    service = VerificationTokenService()

    def create(self, request: Request) -> Response:
        return self.service.create(request)

    @action(methods=["POST"], detail=False)
    def verify(self, request: Request) -> Response:
        return self.service.verify(request)

    @action(methods=["GET"], detail=False, url_path="retrieve-by-token")
    def verify(self, request: Request) -> Response:
        return self.service.retrieve_by_token(request)


class SecurityLogViewSet(ViewSet):
    service = SecurityLogService()

    def create(self, request: Request) -> Response:
        return self.service.create(request)
