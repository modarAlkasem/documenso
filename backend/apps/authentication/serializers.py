# Django Imports
from django.contrib.auth.hashers import make_password

# REST Framework Imports
from rest_framework import serializers

# Project Imports
from core.validators import EmailExistsValidator

# App Imports
from .models import User, VerificationToken, UserSecurityAuditLog
from .constants import TokenIdentifierChoices, EmailVerificationTokenStatusChoices


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

    def to_internal_value(self, data):
        if "email" in data:
            data["email"] = data["email"].strip().lower()
        return super().to_internal_value(data)


class VerificationTokenModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = VerificationToken
        fields = "__all__"


class VerifyTokenRequestSerializer(serializers.Serializer):

    token = serializers.SlugRelatedField(
        queryset=VerificationToken.objects.all(),
        slug_field="token",
        error_messages={"does_not_exist": "Invalid token"},
    )
    identifier = serializers.ChoiceField(choices=TokenIdentifierChoices.choices)


class UserSecurityAuditLogModelSerializer(serializers.ModelSerializer):

    class Meta:

        model = UserSecurityAuditLog
        fields = "__all__"


class RetrieveVerificationTokenByTokenSerializer(VerifyTokenRequestSerializer):

    identifier = None


class VerificationTokenWithUserModelSerializer(VerificationTokenModelSerializer):
    user = UserModelSerializer(required=True)

    class Meta(VerificationTokenModelSerializer.Meta):
        pass
