# REST Framework Imports
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

# Project Imports
from core.response import CustomResponse as Response

# App Imports
# from ..models import VerificationToken, User
from ..serializers import UserSecurityAuditLogModelSerializer


class SecurityLogService:

    def create(self, request: Request) -> Response:
        data = request.data
        serializer = UserSecurityAuditLogModelSerializer(data=data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
