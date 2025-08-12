# REST Framework Imports
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request

# App Imports
from .services import AuthService, VerificationTokenService


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
