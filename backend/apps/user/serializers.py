# REST Framework Imports
from rest_framework import serializers

# Project Imports
from authentication.models import User


user_queryset = User.objects.all()


class CheckUserUniqueFieldValueParamSerializer(serializers.Serializer):
    id = serializers.PrimaryKeyRelatedField(queryset=user_queryset, required=False)
    email = serializers.SlugRelatedField(
        queryset=user_queryset,
        slug_field="email",
        error_messages={"does_not_exist": "Invalid email"},
        required=False,
    )
    url = serializers.SlugRelatedField(
        queryset=user_queryset,
        slug_field="url",
        error_messages={"does_not_exist": "Invalid url"},
        required=False,
    )


class RetrieveUserWithEmailSerializer(serializers.Serializer):
    email = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field="email",
        error_messages={"does_not_exist": "Invalid email"},
    )
