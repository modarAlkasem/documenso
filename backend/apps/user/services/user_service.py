# REST Framework Imports
from rest_framework.request import Request
from rest_framework import status


# Project Imports
from authentication.models import User
from authentication.constants import UserUniqueFieldChoices
from authentication.serializers import (
    UserModelSerializer,
    VerificationTokenModelSerializer,
)
from core.response import CustomResponse as Response

# App Imports
from ..serializers import (
    CheckUserUniqueFieldValueParamSerializer,
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

    def retrieve_by_unique_field(self, request: Request) -> Response:

        query_params = request.query_params
        field_query_param = query_params.get("field")
        value_query_param = query_params.get("value")

        if not field_query_param and field_query_param not in UserUniqueFieldChoices:

            return Response(
                data={"field": "'field' query param is invalid or not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not value_query_param:

            return Response(
                data={"value": "'value' query param is invalid or not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = {field_query_param: value_query_param}
        serializer = CheckUserUniqueFieldValueParamSerializer(data=data)

        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data[field_query_param]
            return Response(
                data=UserModelSerializer(instance=user).data,
                status=status.HTTP_200_OK,
            )

    def unauth_partial_update(self, request: Request, pk: int) -> Response:

        data = request.data
        serializer = UserModelSerializer(data=data)
        response = None

        try:
            if serializer.is_valid(raise_exception=True) and (
                old_user := User.objects.get(id=pk)
            ):
                serializer.instance = old_user
                user = serializer.save()
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
