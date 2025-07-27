# Django Imports
from django.db.transaction import atomic
from django.db import DatabaseError

# REST Framework Imports
from rest_framework import status
from rest_framework.response import Response
from rest_framework.request import Request

# Project Imports
from team.models import TeamMemberInvite, TeamMember
from team.constants import TeamMemberInvitationStatusChoices

# App Imports
from authentication.serializers import CreateUserSerializer, UserModelSerializer
from authentication.models import User


class AuthService:

    def sign_up(self, request: Request) -> Response:
        req_data = request.data
        serializer = CreateUserSerializer(data=req_data)
        if serializer.is_valid(raise_exception=True):
            user: User = serializer.save()

            accepted_team_invites = TeamMemberInvite.objects.filter(
                status=TeamMemberInvitationStatusChoices.ACCEPTED.value,
                email=user.email,
            )
            for accepted_team_invite in accepted_team_invites:
                try:
                    with atomic(durable=True):
                        team_member_dict = {
                            "team": accepted_team_invite.team,
                            "user": user,
                            "role": accepted_team_invite.role,
                        }
                        TeamMember.objects.create(**team_member_dict)
                        accepted_team_invite.delete()
                except DatabaseError as e:
                    accepted_team_invite.status = (
                        TeamMemberInvitationStatusChoices.PENDING.value
                    )
                    accepted_team_invite.save()

            res_data = UserModelSerializer(instance=user).data
            return Response(data=res_data, status=status.HTTP_201_CREATED)
