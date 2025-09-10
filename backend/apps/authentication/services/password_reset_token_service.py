# Python Imports
from datetime import timedelta
import secrets

# Django Imports
from django.utils import timezone

# REST Framework Imports
from rest_framework.request import Request
from rest_framework import status

# Project Imports
from core.response import CustomResponse as Response

# App Imports
from authentication.models import PasswordResetToken
from authentication.serializers import (
    CreatePasswordResetTokenSerializer,
    PasswordResetTokenWithUserModelSerializer,
)
from authentication.constants import CREATE_PASSWORD_RESET_TOKEN_STATUS


class PasswordResetTokenService:

    def create(self, req: Request) -> Response:
        data = req.data.get("json")
        serializer = CreatePasswordResetTokenSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data["email"]
            one_hour_ago = timezone.now() - timedelta(hours=1)
            pass_reset_token_query = {
                "user": user,
                "expires_at__gt": timezone.now(),
                "created_at__gt": one_hour_ago,
            }

            recent_pass_reset_token = PasswordResetToken.objects.filter(
                **pass_reset_token_query
            ).first()
            if recent_pass_reset_token:
                return Response(
                    data=None,
                    status_text=CREATE_PASSWORD_RESET_TOKEN_STATUS[
                        "VALID_ONE_EXISTING"
                    ],
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = secrets.token_hex(18)
            pass_reset_token_dict = {
                "user": user,
                "token": token,
                "expires_at": timezone.now() + timedelta(days=1),
            }

            pass_reset_token_obj = PasswordResetToken.objects.create(
                **pass_reset_token_dict
            )

            response_data = PasswordResetTokenWithUserModelSerializer(
                instance=pass_reset_token_obj
            ).data
            return Response(
                data=response_data,
                status_text=CREATE_PASSWORD_RESET_TOKEN_STATUS["CREATED"],
                status=status.HTTP_201_CREATED,
            )
