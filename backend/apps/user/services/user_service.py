# REST Framework Imports
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

# Project Imports
from authentication.models import User
from authentication.serializers import (
    UserModelSerializer,
    VerificationTokenModelSerializer,
)

# App Imports
from ..serializers import RetrieveUserWithEmailSerializer


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

    def retrieve_by_email(self, request: Request) -> Response:

        try:
            serializer = RetrieveUserWithEmailSerializer(
                data=request.query_params.get()
            )
            if serializer.is_valid(raise_exception=True):
                user = serializer.validated_data["email"]
                return Response(
                    data=UserModelSerializer(instance=user).data,
                    status=status.HTTP_200_OK,
                )

        except ValidationError:
            return Response(
                data={"email": "No user with this email"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def unauth_partial_update(self, request: Request, pk: int) -> Response:

        data = request.data
        serializer = UserModelSerializer(data=data)
        response = None

        try:
            if serializer.is_valid(raise_exception=True) and (
                old_user := User.objects.get(id=pk)
            ):
                user = UserModelSerializer(data=data, instance=old_user).save()
                response = {
                    "data": UserModelSerializer(instance=user).data,
                    "status": status.HTTP_200_OK,
                }
        except User.DoesNotExist:
            response = {
                "data": {"pk": "Invalid user pk"},
                "status": status.HTTP_400_BAD_REQUEST,
            }

        except ValidationError:
            response = {
                "data": serializer.errors,
                "status": status.HTTP_400_BAD_REQUEST,
            }

        return Response(**response)
