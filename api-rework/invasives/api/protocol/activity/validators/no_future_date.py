from datetime import date, datetime
from typing import Union, Optional


def no_future_date(v: Union[str, date, datetime, None]) -> Optional[date]:
    """
    Ensures the date is not in the future.
    Strips time/timezone data from datetime objects to prevent shifting.
    """
    if v is None or v == "":
        return None

    target_date: date

    if isinstance(v, str):
        try:
            target_date = date.fromisoformat(v.split("T")[0])
        except ValueError:
            raise ValueError("Invalid date format. Expected YYYY-MM-DD.")
    elif isinstance(v, datetime):
        target_date = v.date()
    elif isinstance(v, date):
        target_date = v
    else:
        raise ValueError(f"Unsupported type: {type(v)}")
    if target_date > date.today():
        raise ValueError("Date cannot occur in the future")

    return target_date
