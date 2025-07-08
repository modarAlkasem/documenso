# REST Framework Imports
from rest_framework import status
from rest_framework.response import Response
from rest_framework.request import Request

# App Imports
from authentication.serializers import CreateUserSerializer, UserModelSerializer
from authentication.models import User


class AuthService:

    def sign_up(self, request: Request) -> Response:
        req_data = request.data
        serializer = CreateUserSerializer(data=req_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            res_data = UserModelSerializer(instance=user).data
            return Response(data=res_data, status=status.HTTP_201_CREATED)
