"""
Timezone helpers.

Stored timestamps are UTC (timestamptz). Legacy data was written as local wall-clock
time in America/Vancouver, either in naive columns or as ISO strings carrying a bogus
"+00:00" offset. These helpers reinterpret such values; zoneinfo selects PST/PDT per date.
"""

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from django.utils import timezone

# This is correct for most users, and we assume legacy data with no offset to be in this timezone.
# The exact offset here depends on the date (pre/post legislative change)
LOCAL_TZ = ZoneInfo("America/Vancouver")


def legacy_local_to_aware(value: datetime) -> datetime:
    """
    Interpret a legacy datetime as America/Vancouver wall-clock time.

    Naive values and values with a zero (UTC) offset are treated as local wall-clock time.
    Values with a genuine non-zero offset are kept as-is.
    """
    if value.tzinfo is None or value.utcoffset() == timedelta(0):
        return value.replace(tzinfo=LOCAL_TZ)
    return value


def local_date(value: datetime) -> date:
    """Calendar date of an aware datetime in America/Vancouver (naive treated as local)."""
    if timezone.is_naive(value):
        return value.date()
    return value.astimezone(LOCAL_TZ).date()


def assume_local(value: datetime) -> datetime:
    """Offset-less datetimes are America/Vancouver wall-clock time; aware values are kept."""
    if value.tzinfo is None:
        return value.replace(tzinfo=LOCAL_TZ)
    return value


def csv_value(value):
    """Render datetimes as ISO 8601 in America/Vancouver, with offset; pass other values through."""
    if isinstance(value, datetime):
        if timezone.is_naive(value):
            value = value.replace(tzinfo=LOCAL_TZ)
        return value.astimezone(LOCAL_TZ).isoformat(timespec="seconds")
    return value


def local_today() -> date:
    return timezone.localdate(timezone=LOCAL_TZ)
