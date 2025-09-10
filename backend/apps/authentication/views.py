# REST Framework Imports
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.request import Request

# Project Imports
from core.response import CustomResponse as Response

# App Imports
from .services import (
    AuthService,
    VerificationTokenService,
    SecurityLogService,
    PasswordResetTokenService,
)


class AuthViewSet(ViewSet):
    service = AuthService()

    @action(methods=["POST"], detail=False)
    def signup(self, request: Request) -> Response:
        return self.service.sign_up(request)

    @action(methods=["POST"], detail=False)
    def signin(self, request: Request) -> Response:
        return self.service.sign_in(request)


class VerificationTokenViewSet(ViewSet):
    service = VerificationTokenService()

    def create(self, request: Request) -> Response:
        return self.service.create(request)

    def list(self, request: Request) -> Response:
        return self.service.list(request)

    @action(
        methods=["POST"],
        detail=False,
    )
    def verify(self, request: Request) -> Response:
        return self.service.verify(request)

    # @action(methods=["GET"], detail=False, url_path="retrieve-by-token")
    # def retrieve_by_token(self, request: Request) -> Response:
    #     return self.service.retrieve_by_token(request)


class SecurityLogViewSet(ViewSet):
    service = SecurityLogService()

    def create(self, request: Request) -> Response:
        return self.service.create(request)


class PasswordResetTokeniewSet(ViewSet):
    service = PasswordResetTokenService()

    def create(self, request: Request) -> Response:
        return self.service.create(request)
