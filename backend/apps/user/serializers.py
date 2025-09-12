# Django Imports
from django.contrib.auth.hashers import check_password

from django.utils import timezone

# REST Framework Imports
from rest_framework import serializers

# Project Imports
from authentication.models import PasswordResetToken, User, UserSecurityAuditLog


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

        user = self.context.get("user", None)

        if not user:
            raise serializers.ValidationError({"user": "User not found"})

        old_password = user.password

        if check_password(attrs.get("password"), old_password):
            self.deep_error_details = "SAME_PASSWORD"
            raise serializers.ValidationError(code="SAME_PASSWORD")

        return attrs
