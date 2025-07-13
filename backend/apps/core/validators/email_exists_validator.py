# Python Imports
from typing import Union

# Django Imports
from django.core.exceptions import ValidationError

# Project Imports
from authentication.models import User


class EmailExistsValidator:
    message = "Ensure you are using a registed email. "
    code = "email_does_not_exists"

    def __init__(
        self, message: Union[str, None] = None, code: Union[str, None] = None
    ) -> None:
        if message is not None:
            self.message = message

        if code is not None:
            self.code = code

    def __call__(self, email):
        if not User.objects.filter(email=email).exists():
            raise ValidationError(
                self.message,
                self.code,
            )

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, EmailExistsValidator)
            and self.message == other.message
            and self.code == other.code
        )
