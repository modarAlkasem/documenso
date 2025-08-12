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


class TokenIdentifierChoices(models.TextChoices):

    CONFIRMATION_EMAIL = "confirmation-email", _("Confirmation Email")
    PASSKEY_CHALLENGE = "PASSKEY_CHALLENGE", _("PASSKEY_CHALLENGE")


class EmailVerificationTokenStatusChoices(models.TextChoices):
    NOT_FOUND = "NOT_FOUND", "Not Found"
    VERIFIED = "VERIFIED", "Verified"
    EXPIRED = "EXPIRED", "Expired"
    ALREADY_VERIFIED = "ALREADY_VERIFIED", "Already Verified"
