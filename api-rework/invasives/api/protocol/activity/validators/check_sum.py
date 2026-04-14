from typing import Any, Iterable, Optional, Union


def check_sum(
    entries: Iterable[Any],
    expected: Union[int, float],
    key: Optional[str] = None,
    readable: Optional[str] = None,
) -> Iterable[Any]:
    """
    Generic logic to ensure the sum of a list (or a specific key within
    a list of objects) matches an expected total.
    """
    total = 0
    for entry in entries:
        raw_value = getattr(entry, key, entry) if key else entry
        try:
            total += float(raw_value or 0)
        except (ValueError, TypeError):
            total += 0

    if total == expected:
        return entries

    label = f"Sum of {readable}" if readable else "Sum"
    raise ValueError(f"{label} must equal {expected} (current: {total})")
