# Django Imports
from django.contrib.auth.hashers import check_password, make_password

# REST Framework Imports
from rest_framework import serializers

# Project Imports
from core.validators import EmailExistsValidator

# App Imports
from .models import User, VerificationToken, UserSecurityAuditLog
from .constants import (
    TokenIdentifierChoices,
    EmailVerificationTokenStatusChoices,
    SIGN_IN_ERROR_CODES,
    UserSecurityAuditLogTypeChoices,
)


required_true_dict = {"required": True}


class CreateUserSerializer(serializers.ModelSerializer):

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
    expires_at = serializers.DateTimeField()

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


class SignInSerializer(serializers.Serializer):
    deep_error_exists = False
    deep_error_code = None

    email = serializers.EmailField()
    password = serializers.CharField(
        min_length=1,
        max_length=72,
    )
    totp_code = serializers.CharField(
        min_length=4, max_length=4, required=False, allow_blank=True, allow_null=True
    )
    backup_code = serializers.CharField(
        min_length=4, max_length=4, required=False, allow_blank=True, allow_null=True
    )

    ip_address = serializers.IPAddressField(
        required=False, allow_blank=True, allow_null=True
    )
    user_agent = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    def validate(self, attrs: dict):
        user = User.objects.filter(email__iexact=attrs.get("email")).first()

        if not user:

            self.deep_error_exists = True
            self.deep_error_code = SIGN_IN_ERROR_CODES.get("INCORRECT_EMAIL_PASSWORD")
            return attrs

        if not user.password:
            self.deep_error_exists = True
            self.deep_error_code = SIGN_IN_ERROR_CODES.get("USER_MISSING_PASSWORD")
            return attrs

        if not check_password(attrs.get("password"), user.password):

            self.deep_error_exists = True
            self.deep_error_code = SIGN_IN_ERROR_CODES.get("INCORRECT_PASSWORD")

            UserSecurityAuditLog.objects.create(
                user=user,
                type=UserSecurityAuditLogTypeChoices.SIGN_IN_FAIL.value,
                ip_address=attrs.get("ip_address"),
                user_agent=attrs.get("user_agent"),
            )
            return attrs

        if not user.email_verified:
            self.deep_error_exists = True
            self.deep_error_code = SIGN_IN_ERROR_CODES.get("UNVERIFIED_EMAIL")
            return attrs

        if user.disabled:
            self.deep_error_exists = True
            self.deep_error_code = SIGN_IN_ERROR_CODES.get("ACCOUNT_DISABLED")
            return attrs

        attrs["user"] = user
        return attrs
