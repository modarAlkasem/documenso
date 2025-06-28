# Python Imports
import uuid

# Django Imports
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator

# Create your models here.


class Account(models.Model):
    id = models.UUIDField(_("id"), primary_key=True, editable=False, default=uuid.uuid4)
    user = models.ForeignKey(
        "auth.User",
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
    created_at = models.DateTimeField(_("created at"), auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(
        _("updated at"), auto_now=True, blank=True, null=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["provider", "provider_account_id"])
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
        "auth.User",
        _("user"),
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
        related_query_name="password_reset_token",
    )
    created_at = models.DateTimeField(_("created at"), auto_now_add=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("password reset token")
        plural_verbose_name = _("password reset tokens")


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
        "auth.user",
        verbose_name=_("user"),
        blank=True,
        related_name="verification_tokens",
        related_query_name="verification_token",
    )
    created_at = models.DateTimeField(_("created at"), auto_now_add=True, blank=True)

    class Meta:
        verbose_name = _("verification token")
        plural_verbose_name = _("verification tokens")
