# REST Framework Imports
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request

# App Imports
from .services.account_service import AccountService


class AccountViewSet(ViewSet):
    service = AccountService()

    @action(
        methods=["GET"], detail=False, url_path="retrieve-by-provider-and-account-id"
    )
    def retrieve_by_provider_and_account_id(self, req: Request) -> Response:
        return self.service.retrieve_by_provider_and_account_id(req)

    def create(self, request: Request) -> Response:
        return self.service.create(request)
