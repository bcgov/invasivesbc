import datetime
from zoneinfo import ZoneInfo

from django.test import SimpleTestCase

from api.legacy_db.model_serializer import LegacyLocalDatetime
from api.serializers.fields import LocalDateTimeField
from api.protocol.activity.validators.local_datetime import LocalDatetime
from api.protocol.activity.validators.no_future_date import no_future_date
from api.utils.timezones import csv_value, legacy_local_to_aware, local_date
from pydantic import TypeAdapter

UTC = datetime.timezone.utc
VAN = ZoneInfo("America/Vancouver")


class LegacyTimezoneTests(SimpleTestCase):
    def test_zero_offset_reinterpreted_as_local_winter(self):
        v = legacy_local_to_aware(datetime.datetime(2024, 1, 10, 7, 54, tzinfo=UTC))
        self.assertEqual(v.astimezone(UTC).hour, 15)  # PST, UTC-8

    def test_zero_offset_reinterpreted_as_local_summer(self):
        v = legacy_local_to_aware(datetime.datetime(2024, 7, 10, 7, 54, tzinfo=UTC))
        self.assertEqual(v.astimezone(UTC).hour, 14)  # PDT, UTC-7

    def test_naive_treated_as_local(self):
        v = legacy_local_to_aware(datetime.datetime(2024, 3, 18, 7, 54, 2))
        self.assertEqual(v.utcoffset(), datetime.timedelta(hours=-7))

    def test_real_offset_preserved(self):
        original = datetime.datetime(
            2024, 3, 18, 7, 54, tzinfo=datetime.timezone(datetime.timedelta(hours=-6))
        )
        self.assertEqual(legacy_local_to_aware(original), original)

    def test_pydantic_type_parses_bogus_offset(self):
        v = TypeAdapter(LegacyLocalDatetime).validate_python(
            "2024-03-18T07:54:02+00:00"
        )
        self.assertEqual(
            v.astimezone(UTC), datetime.datetime(2024, 3, 18, 14, 54, 2, tzinfo=UTC)
        )

    def test_local_date_uses_vancouver_day(self):
        late = datetime.datetime(2024, 3, 18, 20, 0, tzinfo=VAN)  # next day in UTC
        self.assertEqual(local_date(late), datetime.date(2024, 3, 18))

    def test_csv_value_iso_with_offset(self):
        self.assertEqual(
            csv_value(datetime.datetime(2024, 1, 10, 15, 54, tzinfo=UTC)),
            "2024-01-10T07:54:00-08:00",
        )
        self.assertEqual(
            csv_value(datetime.datetime(2024, 7, 10, 14, 54, tzinfo=UTC)),
            "2024-07-10T07:54:00-07:00",
        )
        self.assertEqual(csv_value("x"), "x")

    def test_local_field_round_trip(self):
        f = LocalDateTimeField()
        utc_value = datetime.datetime(2024, 7, 10, 14, 54, tzinfo=UTC)
        self.assertEqual(f.to_representation(utc_value), "2024-07-10T07:54")
        self.assertEqual(f.to_internal_value("2024-07-10T07:54"), utc_value)
        self.assertEqual(f.to_internal_value("2024-07-10T14:54:00Z"), utc_value)

    def test_ninja_schema_naive_input_is_local(self):
        v = TypeAdapter(LocalDatetime).validate_python("2024-07-10T07:54")
        self.assertEqual(v, datetime.datetime(2024, 7, 10, 14, 54, tzinfo=UTC))

    def test_no_future_date_uses_local_time(self):
        now_local = datetime.datetime.now(VAN).replace(tzinfo=None)
        past = (now_local - datetime.timedelta(minutes=5)).isoformat()
        future = (now_local + datetime.timedelta(minutes=5)).isoformat()
        no_future_date(past)
        with self.assertRaises(ValueError):
            no_future_date(future)
