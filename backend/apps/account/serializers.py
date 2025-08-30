# Django Imports
from django.contrib.auth.hashers import make_password

# REST Framework Imports
from rest_framework import serializers

# Project Imports
from authentication.serializers import UserModelSerializer
from authentication.models import User

# App Imports
from .models import Account
from .constants import AccountProviderChoices


class RetrieveAccountByProviderAndAccountIdSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=AccountProviderChoices.choices)
    provider_account_id = serializers.CharField()

    def validate(self, attrs: dict) -> dict:
        provider_account_id = attrs.get("provider_account_id")

        if not Account.objects.filter(provider_account_id=provider_account_id).first():
            raise serializers.ValidationError(
                {"provider_account_id": "Invalid 'provider_account_id'"}
            )

        attrs["account"] = Account.objects.filter(
            provider_account_id=provider_account_id, provider=attrs.get("provider")
        ).first()

        return attrs


class AccountModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Account
        fields = "__all__"


class UserWithoutUniqueEmailModelSerializer(UserModelSerializer):

    email = serializers.EmailField(required=False)

    class Meta(UserModelSerializer.Meta):
        pass


class AccountWithRelatedUserModelSerializer(AccountModelSerializer):
    user = UserWithoutUniqueEmailModelSerializer()

    def create(self, validated_data: dict) -> Account:
        user_data: dict = validated_data.pop("user")
        user = User.objects.filter(email=user_data.get("email")).first()

        if user_data.get("password") and (
            hashed_pass := make_password(validated_data.get("password"))
        ):
            user_data["password"] = hashed_pass

        if not user:
            user = User._default_manager.create(**user_data)

        elif (
            user
            and validated_data.get("provider") == AccountProviderChoices.MANUAL.value
        ):
            for key, value in validated_data.items():
                setattr(user, key, value)

            user.save()

        validated_data["user"] = user
        validated_data["provider_account_id"] = (
            user.id
            if validated_data["provider"] == AccountProviderChoices.MANUAL.value
            else validated_data["provider_account_id"]
        )
        model_class = self.Meta.model
        return model_class.objects.create(**validated_data)

    class Meta(AccountModelSerializer.Meta):
        pass
