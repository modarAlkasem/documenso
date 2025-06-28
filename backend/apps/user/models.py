# Python Imports
import uuid

# Django Imports
from django.db import models
from django.utils.translation import gettext_lazy as _


# Create your models here.


class UserProfile(models.Model):
    id = models.UUIDField(_("id"), editable=False, primary_key=True, default=uuid.uuid4)
    enabled = models.BooleanField(_("enabled"), default=False)
    bio = models.TextField(_("bio"), blank=True, null=True)
    user = models.OneToOneField(
        "auth.User",
        verbose_name=_("profile"),
        on_delete=models.CASCADE,
        related_name="profile",
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


class AvatarImage(models.Model):
    id = models.UUIDField(_("id"), primary_key=True, editable=False, default=uuid.uuid4)

    bytes = models.TextField(
        _("bytes"), default="base64-encoded image or binary string"
    )
