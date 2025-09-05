# Pyhton Imports
from typing import Any, Union

# DRF Imports
from rest_framework.response import Response


class CustomResponse(Response):

    _status_text = "SUCCESS"

    def __init__(
        self,
        data: Any = None,
        status: Union[None, int] = None,
        status_text: Union[None, str] = None,
        template_name: Union[None, str] = None,
        headers: Union[None, dict] = None,
        content_type: Union[None, str] = None,
    ):

        if status_text:
            self._status_text = status_text

        super().__init__(data, status, template_name, headers, content_type)

    @property
    def status_text(self):
        return self._status_text

    @status_text.setter
    def status_text(self, value):
        self._status_text = value
