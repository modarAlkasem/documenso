# Pythom Imports
from uuid import UUID
from pytz import timezone
from datetime import datetime, timedelta
import secrets

# REST Framework Imports
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

# App Imports
from ..models import VerificationToken, User
from ..serializers import (
    CreateVerificationTokenSerializer,
    VerificationTokenModelSerializer,
)


class VerificationTokenService:

    def create(self, request: Request):
        data = request.data
        serializer = CreateVerificationTokenSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            verification_token = None
            email, identifier, expires, force = map(
                serializer.validated_data.get,
                ("email", "identifier", "expires", "force"),
            )
            user = User.objects.get(email=email)
            recent_token: VerificationToken = user.verification_tokens.first()
            print(recent_token.id)
            print(
                abs(recent_token.created_at - datetime.now(tz=timezone("UTC")))
                < timedelta(minutes=5)
            )
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
