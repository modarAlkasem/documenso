# REST Framework Imports
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

# Project Imports
from authentication.models import User
from authentication.serializers import UserModelSerializer

# App Imports
from authentication.serializers import (
    UserModelSerializer,
    VerificationTokenModelSerializer,
)


class UserService:

    def retrieve(self, request: Request, pk) -> Response:
        try:
            user = User.objects.get(id=pk)
            return Response(data=UserModelSerializer(instance=user).data)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def retrieve_with_recent_token(self, request: Request, user_id) -> Response:
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response(
                data="User with the given ID not found.",
                status=status.HTTP_404_NOT_FOUND,
            )
        serialized_user = UserModelSerializer(instance=user).data
        serialized_user["verification_token"] = None
        recent_token = user.verification_tokens.first()
        if recent_token:
            serialized_user["verification_token"] = VerificationTokenModelSerializer(
                instance=recent_token
            ).data

        return Response(
            data=serialized_user,
            status=status.HTTP_200_OK,
        )
