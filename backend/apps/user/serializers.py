# REST Framework Imports
from rest_framework import serializers

# Project Imports
from authentication.models import User


class RetrieveUserWithEmailSerializer(serializers.Serializer):
    email = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field="email",
        error_messages={"does_not_exist": "Invalid email"},
    )
