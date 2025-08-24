# Python Imports
import uuid

# Django Imports
from django.db import models
from django.utils.translation import gettext_lazy as _

# Project Imports
from core.models import UUIDModel
from authentication.models import User


class UserProfile(User):

    enabled = models.BooleanField(_("enabled"), default=False)
    bio = models.TextField(_("bio"), blank=True, null=True)
    user = models.OneToOneField(
        "authentication.User",
        verbose_name=_("profile"),
        on_delete=models.CASCADE,
        related_name="profile",
        parent_link=True,
    )
    avatar_image = models.ForeignKey(
        "AvatarImage",
        verbose_name="avatar image",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="users",
        related_query_name="user",
    )


class AvatarImage(UUIDModel):

    bytes = models.TextField(
        _("bytes"), default="base64-encoded image or binary string"
    )
