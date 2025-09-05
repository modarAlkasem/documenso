# Pythom Imports
from uuid import UUID
from pytz import timezone
from datetime import datetime, timedelta
import secrets

# Django Imports
from django.db.transaction import atomic

# REST Framework Imports
from rest_framework.request import Request
from rest_framework import status
from rest_framework.utils.serializer_helpers import ReturnDict

# Project Imports
from core.response import CustomResponse as Response

# App Imports
from ..models import VerificationToken, User
from ..serializers import (
    CreateVerificationTokenSerializer,
    VerificationTokenModelSerializer,
    VerifyTokenRequestSerializer,
    UserModelSerializer,
    VerificationTokenWithUserModelSerializer,
    RetrieveVerificationTokenByTokenSerializer,
)
from ..constants import EmailVerificationTokenStatusChoices, TokenIdentifierChoices


class VerificationTokenService:

    def create(self, request: Request):
        data = request.data.get("json")
        serializer = CreateVerificationTokenSerializer(data=data)

        if serializer.is_valid(raise_exception=True):
            verification_token = None
            email, identifier, expires, force = map(
                serializer.validated_data.get,
                ("email", "identifier", "expires_at", "force"),
            )
            user: User = User.objects.get(email=email)
            if user.email_verified:
                return Response(
                    data="Email is already verified",
                    status=status.HTTP_400_BAD_REQUEST,
                )
            recent_token: VerificationToken = user.verification_tokens.first()

            if (
                recent_token
                and not force
                and abs(recent_token.created_at - datetime.now(tz=timezone("UTC")))
                < timedelta(minutes=5)
            ):
                verification_token = recent_token
            if not verification_token:
                token_hex_code = secrets.token_hex(20)
                token_expires_at = datetime.now() + timedelta(hours=1)
                token_dict = {
                    "identifier": identifier,
                    "user": user,
                    "token": token_hex_code,
                    "expires_at": token_expires_at,
                }
                verification_token = VerificationToken.objects.create(**token_dict)

            response_data = VerificationTokenModelSerializer(
                instance=verification_token
            ).data
            return Response(data=response_data, status=status.HTTP_201_CREATED)

    def verify(self, request: Request) -> Response:
        data = request.data.get("json")
        serializer = VerifyTokenRequestSerializer(data=data)

        if not serializer.is_valid() and isinstance(serializer.errors, ReturnDict):
            errors = serializer.errors
            if errors.get("token") and "Invalid token" in errors.get("token"):
                return Response(
                    data={
                        "status": EmailVerificationTokenStatusChoices.NOT_FOUND.value
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(data=errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        identifier = validated_data.get("identifier")
        match identifier:

            case TokenIdentifierChoices.CONFIRMATION_EMAIL.value:
                return self.__verify_confirmation_email_token(
                    validated_data.get("token")
                )

            case _:
                pass

    def __verify_confirmation_email_token(self, token: VerificationToken) -> Response:
        token_status = None
        user: User = token.user
        now = datetime.now(tz=timezone("UTC"))
        valid = now < token.expires_at

        if not valid:
            most_recent_token = VerificationToken.objects.filter(user=user).first()
            if most_recent_token.created_at < (now - timedelta(hours=1)):
                token_status = EmailVerificationTokenStatusChoices.EXPIRED.value

        elif token.completed:
            token_status = EmailVerificationTokenStatusChoices.ALREADY_VERIFIED.value
        else:
            try:
                with atomic(durable=True):
                    user.email_verified = now
                    user.save()

                    token.completed = True
                    token.save()

                    VerificationToken.objects.filter(expires_at__lt=now).delete()

                    token_status = EmailVerificationTokenStatusChoices.VERIFIED.value
            except:
                return Response(
                    data=None,
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        response = {"status": token_status}
        if EmailVerificationTokenStatusChoices.EXPIRED.value:
            response["user"] = UserModelSerializer(instance=token.user).data

        return Response(
            data=response,
            status=status.HTTP_200_OK,
        )

    def retrieve_by_token(self, request: Request) -> Response:
        query_params = request.query_params
        serializer = RetrieveVerificationTokenByTokenSerializer(data=query_params)

        if serializer.is_valid(raise_exception=True):
            token = serializer.validated_data.get("token")

            response_data = VerificationTokenWithUserModelSerializer(
                instance=token
            ).data
            return Response(
                data=response_data,
                status=status.HTTP_200_OK,
            )
