# Python Imports
import uuid

# Django Imports
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.core.serializers.json import DjangoJSONEncoder

# App Imports
from auth.constants import RoleChoices, IdentityProviderChoices

# Create your models here.


class User(models.Model):

    name = models.CharField(
        _("name"),
        max_length=150,
        validators=[MinValueValidator(2)],
        blank=True,
        help_text="User's full name",
    )
    customer_id = models.CharField(
        "customer id", max_length=150, unique=True, blank=True, help_text="Customer id"
    )
    email = models.EmailField(
        _("email"), unique=True, blank=True, help_text="User's email"
    )
    email_verified = models.DateTimeField(
        "email verified", blank=True, null=True, help_text="When user got verified."
    )
    password = models.CharField(
        _("password"),
        max_length=72,
        validators=[MinValueValidator(8)],
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
    created_at = models.DateTimeField(_("created at"), auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(
        _("updated at"), auto_now=True, null=True, blank=True
    )
    last_signed_in = models.DateTimeField(
        _("last signed in"), blank=True, auto_now_add=True
    )

    def get_default_roles(self):
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
        validators=[MinValueValidator(1)],
        blank=True,
        help_text="User's public profile URL",
    )
    avatar_image = models.ForeignKey(
        "user.AvatarImage",
        verbose_name="avatar image",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = _("user")
        plural_verbose_name = _("users")


class Session(models.Model):
    id = models.UUIDField(_("id"), primary_key=True, editable=False, default=uuid.uuid4)
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

    class Meta:
        verbose_name = _("session")
        plural_verbose_name = _("sessions")
