# Django Imports
from django.contrib.auth.hashers import make_password

# REST Framework Imports
from rest_framework import serializers

# Project Imports
from core.validators import EmailExistsValidator

# App Imports
from .models import User, VerificationToken
from .constants import TokenIdentifierChoices


required_true_dict = {"required": True}


class CreateUserSerializer(serializers.ModelSerializer):

    def validate(self, data: dict) -> dict:
        if data.get("password", None):
            data["password"] = make_password(data["password"])
        if data.get("email", None):
            data["email"] = data["email"].lower().strip()
        return data

    class Meta:
        model = User
        fields = ("name", "email", "password", "signature", "url")
        extra_kwargs = {
            "name": required_true_dict,
            "email": {"required": required_true_dict},
            "password": {"required": required_true_dict},
        }


class UserModelSerializer(CreateUserSerializer):

    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {"password": {"write_only": True}}


class CreateVerificationTokenSerializer(serializers.Serializer):
    force = serializers.BooleanField(default=False)
    email = serializers.EmailField(validators=[EmailExistsValidator()])
    identifier = serializers.ChoiceField(choices=TokenIdentifierChoices.choices)
    expires = serializers.DateTimeField()


class VerificationTokenModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = VerificationToken
        fields = "__all__"
