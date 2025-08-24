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

    def create(self, validated_data: dict) -> Account:
        user_data = validated_data.pop("user")
        user: User = User._default_manager.create(**user_data)

        validated_data["user"] = user
        validated_data["provider_account_id"] = user.id
        model_class = self.Meta.model
        return model_class.objects.create(**validated_data)

    class Meta:
        model = Account
        fields = "__all__"


class AccountWithRelatedUserModelSerializer(AccountModelSerializer):
    user = UserModelSerializer()

    class Meta(AccountModelSerializer):
        pass
