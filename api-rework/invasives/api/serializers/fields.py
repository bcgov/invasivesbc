from rest_framework import serializers

from api.utils.timezones import LOCAL_TZ

FORM_DATETIME_FORMAT = "%Y-%m-%dT%H:%M"


class LocalDateTimeField(serializers.DateTimeField):
    """
    DateTimeField that renders and parses in America/Vancouver rather than the
    project default (UTC).

    The default output format matches an HTML datetime-local input (no offset), so
    the frontend shows local wall-clock time. Input carrying an offset is honoured
    and converted; offset-less input is interpreted as America/Vancouver time.
    """

    def __init__(self, format=FORM_DATETIME_FORMAT, **kwargs):
        super().__init__(format=format, **kwargs)

    def default_timezone(self):
        return LOCAL_TZ
