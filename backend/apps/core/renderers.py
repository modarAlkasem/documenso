# Python Imports
from typing import Any, Union

# REST Framework Imports
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response


class CustomJSONRenderer(JSONRenderer):

    def render(
        self,
        data: Any,
        accepted_media_type: Union[None, str] = None,
        renderer_context: Union[None, dict] = None,
    ) -> bytes:
        response: Response = renderer_context.get("response")
        status_code = response.status_code
        wrapped_data = {
            "status_code": status_code,
            "status": (
                "SUCCESS"
                if status_code < 400
                else ("FAILURE" if status_code < 500 else "ERROR")
            ),
        }
        if wrapped_data["status"] == "SUCCESS":
            wrapped_data["data"] = data
        else:
            wrapped_data["errors"] = data

        return super().render(wrapped_data, accepted_media_type, renderer_context)
