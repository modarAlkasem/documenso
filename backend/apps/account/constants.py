# Django Imports
from django.db.models import TextChoices


class AccountProviderChoices(TextChoices):
    MANUAL = "manual", "manual"
    GOOGLE = "google", "google"
