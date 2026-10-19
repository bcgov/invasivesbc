from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator

from api.utils.timezones import assume_local

LocalDatetime = Annotated[datetime, AfterValidator(assume_local)]
"""Datetime from the frontend: offset-less values are America/Vancouver wall-clock time; explicit offsets are honoured."""
