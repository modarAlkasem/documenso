# Django Imports
from django.db.models.query import QuerySet


# Third-party Imports
from django_filters.rest_framework import filters, FilterSet
from datetime import datetime

# App Imports
from .models import VerificationToken


class VerificationTokenFilter(FilterSet):
    user_id = filters.NumberFilter(field_name="user__id")
    user_email = filters.CharFilter(field_name="user__email")
    created_at = filters.CharFilter(method="created_at_filter")

    class Meta:
        model = VerificationToken
        fields = ("token",)

    def created_at_filter(
        self, queryset: QuerySet, name: str, value: datetime
    ) -> QuerySet:

        if value == "last":
            return QuerySet(queryset.first())

        return queryset
