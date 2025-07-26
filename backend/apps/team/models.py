# Django Imports
from django.db import models

# Project Imports
from core.models import CreatedAtModel

# App Imports
from team.constants import TeamMemberRoleChoices, TeamMemberInvitationStatusChoices


USER_MODEL_IMPORT_STRING = "authentication.User"


class Team(CreatedAtModel):

    name = models.CharField(max_length=255, blank=True)
    url = models.CharField(max_length=255, blank=True)
    avatar_image = models.ForeignKey(
        "user.AvatarImage",
        on_delete=models.CASCADE,
        related_name="teams",
        related_query_name="team",
        blank=True,
    )
    owner_user = models.ForeignKey(
        USER_MODEL_IMPORT_STRING,
        on_delete=models.CASCADE,
        related_name="owned_teams",
        related_query_name="owned_team",
        blank=True,
    )
    users = models.ManyToManyField(
        USER_MODEL_IMPORT_STRING,
        through="team.TeamMember",
        blank=True,
    )

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "team"
        verbose_name_plural = "teams"


class TeamMember(CreatedAtModel):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="team_members",
        related_query_name="team_member",
        blank=True,
    )
    user = models.ForeignKey(
        USER_MODEL_IMPORT_STRING,
        on_delete=models.CASCADE,
        related_name="team_memberships",
        related_query_name="team_membership",
        blank=True,
    )
    role = models.CharField(
        max_length=7, choices=TeamMemberRoleChoices.choices, blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "team"], name="unique_user_team")
        ]

        verbose_name = "team member"
        verbose_name_plural = "team members"


class TeamMemberInvite(CreatedAtModel):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="team_member_invites",
        related_query_name="team_member_invite",
        blank=True,
    )
    email = models.EmailField(blank=True)
    role = models.CharField(
        max_length=7, choices=TeamMemberRoleChoices.choices, blank=True
    )
    status = models.CharField(
        max_length=10, blank=True, choices=TeamMemberInvitationStatusChoices.choices
    )
    token = models.CharField(max_length=255, blank=True, unique=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["team", "email"], name="unique_team_email")
        ]

        verbose_name = "team membership invitation"
        verbose_name_plural = "team membership invitations"
