# Django Imports
from django.contrib.auth.hashers import check_password, make_password
from django.db.transaction import atomic
from django.utils import timezone

# REST Framework Imports
from rest_framework import serializers

# Project Imports
from core.validators import EmailExistsValidator

# App Imports
from .models import User, VerificationToken, UserSecurityAuditLog, PasswordResetToken
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
    def update(self, instance, validated_data):
        if "password" in validated_data:
            new_password = validated_data.get("password", None)
            hashed_password = make_password(new_password)

            instance.password = hashed_password
            instance.save()

            with atomic(durable=True):
                PasswordResetToken.objects.filter(user=instance).delete()

                audit_log_dict = {
                    "user": instance,
                    "type": UserSecurityAuditLogTypeChoices.PASSWORD_RESET.value,
                    "ip_address": validated_data.get("ip_address", None),
                    "user_agent": validated_data.get("user_agent", None),
                }
                UserSecurityAuditLog.objects.create(**audit_log_dict)

            return instance

        return super().update(instance, validated_data)

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


class CreatePasswordResetTokenSerializer(serializers.Serializer):
    email = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field="email",
        error_messages={"does_not_exist": "Invalid email"},
    )

    def to_internal_value(self, data):
        email = data.get("email", None)
        if email:
            data["email"] = email.strip().lower()
        return super().to_internal_value(data)


class PasswordResetTokenWithUserModelSerializer(serializers.ModelSerializer):
    user = UserModelSerializer()

    class Meta:
        model = PasswordResetToken
        fields = "__all__"
        extra_kwargs = {
            field.name: {"required": False} for field in PasswordResetToken._meta.fields
        }


class ResetPasswordSerializer(serializers.Serializer):

    token = serializers.CharField(min_length=36, max_length=36)
    password = serializers.CharField(max_length=72, min_length=8)
    ip_address = serializers.IPAddressField()
    user_agent = serializers.CharField()

    def validate(self, attrs):
        token = PasswordResetToken.objects.filter(
            token=attrs.get("token", None)
        ).first()

        if not token:
            self.deep_error_details = "INVALID_TOKEN"
            raise serializers.ValidationError(code="INVALID_TOKEN")

        if token.expires_at < timezone.now():
            self.deep_error_details = "INVALID_TOKEN"
            raise serializers.ValidationError(code="INVALID_TOKEN")

        user = token.user

        if not user:
            raise serializers.ValidationError({"user": "User not found"})

        old_password = user.password

        if check_password(attrs.get("password"), old_password):
            self.deep_error_details = "SAME_PASSWORD"
            raise serializers.ValidationError(code="SAME_PASSWORD")

        attrs["token"] = token
        return attrs
