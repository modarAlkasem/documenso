# Python Imports
import uuid

# Django Imports
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator

# Project Imports
from core.models import TimeStampedUUIDModel


class Account(TimeStampedUUIDModel):

    user = models.ForeignKey(
        "authentication.User",
        verbose_name=_("user"),
        on_delete=models.CASCADE,
        related_name="accounts",
        related_query_name="account",
        blank=True,
        help_text="User this account is related to.",
    )
    type = models.CharField(
        _("type"),
        max_length=50,
        blank=True,
        null=True,
        validators=[MinLengthValidator(1)],
        help_text="Specify how user is being authenticated (e.g. credentials, oauth).",
    )
    provider = models.CharField(
        _("provider"),
        max_length=50,
        validators=[MinLengthValidator(3)],
        help_text="Specify what is the authentication provider is used to authenticated the user (e.g. current system, google, OIDC ).",
        blank=True,
    )
    provider_account_id = models.CharField(
        _("provider account id"),
        max_length=255,
        validators=[MinLengthValidator(1)],
        blank=True,
        help_text="Unique identifier provided by authentication provider.",
    )
    refresh_token = models.TextField(
        _("refresh token"),
        blank=True,
        null=True,
        help_text="Token to obtain a new  Access Token when old one gets expired.",
    )
    access_token = models.TextField(
        _("access token"),
        blank=True,
        null=True,
        help_text="Token to authenticate user.",
    )
    expires_at = models.DateTimeField(
        _("expires at"),
        blank=True,
        null=True,
        help_text="Specify when access token or session will expire.",
    )
    ext_expires_in = models.IntegerField(
        _("extended expires in"),
        blank=True,
        null=True,
        help_text="Duration in seconds indicating how long access token is valid after it expires",
    )

    token_type = models.CharField(
        _("token type"),
        max_length=20,
        validators=[MinLengthValidator(3)],
        blank=True,
        null=True,
        help_text="Specify type of token issued by authentication provider (e.g. Bearer, MAC)",
    )
    scope = models.TextField(
        _("scope"),
        blank=True,
        null=True,
        help_text="List of permissions or access scopes granted by Identity provider when token issued.",
    )
    id_token = models.TextField(
        _("id token"),
        blank=True,
        null=True,
        help_text="JWT Auth token to authenticate user and provide the basic user information.",
    )
    session_state = models.CharField(
        _("session state"),
        max_length=255,
        validators=[MinLengthValidator(10)],
        blank=True,
        null=True,
        help_text="Helps app to know if user logged out or if there is any change in user's session",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "provider_account_id"],
                name="provider_account_id_unique",
            )
        ]


class PasswordResetToken(models.Model):
    token = models.CharField(
        _("token"),
        max_length=255,
        help_text="Reset Password's token sent to user's email",
    )

    expires_at = models.DateTimeField(
        _("expires at"),
        help_text="Specify when access token or session will expire.",
    )
    user = models.ForeignKey(
        "authentication.User",
        verbose_name=_("user"),
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
        related_query_name="password_reset_token",
    )
    created_at = models.DateTimeField(
        _("created at"),
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("password reset token")
        verbose_name_plural = _("password reset tokens")
