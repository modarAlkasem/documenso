# REST Framework Imports
from rest_framework import status
from rest_framework.response import Response
from rest_framework.request import Request

# App Imports
from ..serializers import (
    RetrieveAccountByProviderAndAccountIdSerializer,
    AccountModelSerializer,
    AccountWithRelatedUserModelSerializer,
)


class AccountService:

    def create(self, req: Request) -> Response:
        data = req.data
        serializer = AccountWithRelatedUserModelSerializer(data=data)

        if serializer.is_valid(raise_exception=True):
            account = AccountWithRelatedUserModelSerializer(
                data=serializer.validated_data
            ).save()

            response_data = AccountWithRelatedUserModelSerializer(instance=account).data
            return Response(data=response_data, status=status.HTTP_201_CREATED)

    def retrieve_by_provider_and_account_id(self, req: Request) -> Response:
        query_params = req.query_params.get()
        serializer = RetrieveAccountByProviderAndAccountIdSerializer(data=query_params)

        if serializer.is_valid(raise_exception=True):
            account = serializer.validated_data.get("account")
            response_data = (
                AccountModelSerializer(instance=account).data if account else None
            )

            return Response(data=response_data, status=status.HTTP_200_OK)
