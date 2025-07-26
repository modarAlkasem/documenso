# Django Imports
from django.db.models import TextChoices
from django.utils.translation import gettext_lazy as _


class TeamMemberRoleChoices(TextChoices):

    ADMIN = ("ADMIN", "Admin")
    MANAGER = ("MANAGER", "Manager")
    MEMBER = ("MEMBER", "Member")


class TeamMemberInvitationStatusChoices(TextChoices):
    PENDING = ("PENDING", "Pending")
    ACCEPTED = ("ACCEPTED", "Accepted")
    DECLINED = ("DECLINED", "Declined")
