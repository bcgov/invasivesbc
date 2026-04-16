from datetime import date, datetime
from typing import Union


def no_future_date(v: Union[str, date, datetime, None]) -> Union[datetime, date, None]:
    """
    Ensures the date/time is not in the future.
    Preserves time data if provided.
    """
    if v is None or v == "":
        return None

    if isinstance(v, str):
        try:
            target = datetime.fromisoformat(v)
        except ValueError:
            try:
                target = date.fromisoformat(v)
            except ValueError:
                raise ValueError("Invalid format. Expected YYYY-MM-DD or ISO datetime.")
    else:
        target = v

    if isinstance(target, datetime):
        if target > datetime.now():
            raise ValueError("Time cannot occur in the future")
    elif isinstance(target, date):
        if target > date.today():
            raise ValueError("Date cannot occur in the future")

    return target
