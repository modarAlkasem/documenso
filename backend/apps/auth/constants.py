# Django Imports
from django.db import models
from django.utils.translation import gettext_lazy as _


class RoleChoices(models.TextChoices):
    ADMIN = ("ADMIN", _("Admin"))
    USER = ("USER", _("User"))


class IdentityProviderChoices(models.TextChoices):

    DOCUMENSO = "DOCUMENSO", _("Documenso")
    GOOGLE = "GOOGLE", _("Google")
    OIDC = "OIDC", _("OIDC")
