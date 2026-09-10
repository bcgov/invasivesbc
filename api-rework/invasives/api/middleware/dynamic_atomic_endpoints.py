from django.db import transaction
import re


class DynamicAtomicEndpointsMiddleware:
    """
    Dynamically sets transactions on all non-vector tiles requests.
    Attempting to default ATOMIC_REQUESTS=True results in errors where Django does not Async transactions
    (Async transactions are used in Vector tile generation)
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Pre-compile the pattern matching your vector tile route
        tile_url_pattern = re.compile(r"^/ninja/tiles/\d+/\d+/\d+$")
        if not tile_url_pattern.match(request.path_info):
            with transaction.atomic():
                response = self.get_response(request)
                return response

        return self.get_response(request)
