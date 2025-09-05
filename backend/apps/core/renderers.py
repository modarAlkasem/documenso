# Python Imports
from typing import Any, Union

# REST Framework Imports
from rest_framework.renderers import JSONRenderer

# Project Imports
from core.response import CustomResponse as Response


class CustomJSONRenderer(JSONRenderer):

    def render(
        self,
        data: Any,
        accepted_media_type: Union[None, str] = None,
        renderer_context: Union[None, dict] = None,
    ) -> bytes:
        response: Response = renderer_context.get("response")
        status_code = response.status_code
        status_text = response.status_text

        if status_code >= 500 and status_text == "SUCCESS":
            status_text = "UNKNOWN_ERROR"

        elif status_code >= 400 and status_text == "SUCCESS":
            status_text = "BAD_REQUEST"

        wrapped_data = {
            "status_code": status_code,
            "status_text": status_text,
        }
        if wrapped_data["status_text"] == "SUCCESS":
            wrapped_data["data"] = data
        else:
            wrapped_data["errors"] = data

        return super().render(wrapped_data, accepted_media_type, renderer_context)
