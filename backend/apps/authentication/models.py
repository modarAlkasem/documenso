# Python Imoprts
import uuid

# Django Imports
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator
from django.core.serializers.json import DjangoJSONEncoder

# Project Imports
from core.models import TimeStampedModel, UUIDModel

# App Imports
from authentication.constants import (
    RoleChoices,
    IdentityProviderChoices,
    TokenIdentifierChoices,
)


class User(TimeStampedModel):

    name = models.CharField(
        _("name"),
        max_length=150,
        validators=[MinLengthValidator(2)],
        blank=True,
        help_text="User's full name",
    )
    customer_id = models.CharField(
        "customer id",
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text="Customer id",
    )
    email = models.EmailField(
        _("email"), unique=True, blank=True, help_text="User's email"
    )
    email_verified = models.DateTimeField(
        "email verified", blank=True, null=True, help_text="When user got verified."
    )
    password = models.CharField(
        _("password"),
        max_length=128,
        validators=[MinLengthValidator(8)],
        blank=True,
        null=True,
        help_text="User's password",
    )
    source = models.CharField(_("source"), max_length=150, blank=True, null=True)
    signature = models.CharField(
        _("signature"),
        max_length=250,
        blank=True,
        null=True,
        help_text="User's signature",
    )

    last_signed_in = models.DateTimeField(_("last signed in"), auto_now_add=True)

    def get_default_roles():
        return [RoleChoices.USER.value]

    roles = models.JSONField(
        _("roles"), encoder=DjangoJSONEncoder, default=get_default_roles
    )

    identity_provider = models.CharField(
        _("identity provider"),
        blank=True,
        choices=IdentityProviderChoices.choices,
        default=IdentityProviderChoices.DOCUMENSO.value,
    )

    disabled = models.BooleanField(_("disabled"), blank=True, default=False)
    url = models.CharField(
        _("URL"),
        max_length=150,
        validators=[MinLengthValidator(1)],
        blank=True,
        null=True,
        unique=True,
        help_text="User's public profile URL",
    )

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")


class Session(UUIDModel):

    session_token = models.CharField(
        _("session token"),
        max_length=255,
        blank=True,
        unique=True,
        help_text="Token that stored on the client (e.g. cookie, header)",
    )
    user = models.ForeignKey(
        User,
        verbose_name=_("user"),
        blank=True,
        on_delete=models.CASCADE,
        related_name="sessions",
        related_query_name="session",
    )
    expires_at = models.DateTimeField(_("expires at"), blank=True)


class VerificationToken(models.Model):
    secondary_id = models.UUIDField(
        _("secondary id"),
        default=uuid.uuid4,
        blank=True,
        help_text="Extra unique ID",
        unique=True,
    )
    identifier = models.CharField(
        _("identifier"),
        max_length=255,
        validators=[MinLengthValidator(3)],
        choices=TokenIdentifierChoices.choices,
        blank=True,
        help_text="Purpose or the target of token.",
    )
    token = models.TextField(
        _("token"), blank=True, help_text="Actual token", unique=True
    )
    completed = models.BooleanField(
        _("completed"),
        default=False,
        blank=True,
        help_text="Specify whether token is used or not yet.",
    )
    expires_at = models.DateTimeField(
        _("expires at"), blank=True, help_text="Specify when token gets expired"
    )
    user = models.ForeignKey(
        User,
        verbose_name=_("user"),
        on_delete=models.CASCADE,
        blank=True,
        related_name="verification_tokens",
        related_query_name="verification_token",
    )
    created_at = models.DateTimeField(_("created at"), auto_now_add=True, blank=True)

    class Meta:
        verbose_name = _("verification token")
        verbose_name_plural = _("verification tokens")
        ordering = ("-created_at",)
