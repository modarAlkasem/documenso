# REST Framework Imports
from rest_framework import serializers

# Project Imports
from authentication.models import User
from authentication.constants import UserUniqueFieldChoices


user_queryset = User.objects.all()


class CheckUserUniqueFieldValueParamSerializer(serializers.Serializer):
    id = serializers.PrimaryKeyRelatedField(queryset=user_queryset)
    email = serializers.SlugRelatedField(
        queryset=user_queryset,
        slug_field="email",
        error_messages={"does_not_exist": "Invalid email"},
    )
    url = serializers.SlugRelatedField(
        queryset=user_queryset,
        slug_field="url",
        error_messages={"does_not_exist": "Invalid url"},
    )


class RetrieveUserWithEmailSerializer(serializers.Serializer):
    email = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field="email",
        error_messages={"does_not_exist": "Invalid email"},
    )
