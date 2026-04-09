from typing import Iterable, Optional, TypeVar

T = TypeVar("T")


def no_repeat_key(
    entries: Iterable[T], key: str, key_label: Optional[str] = None
) -> Iterable[T]:
    """
    Generic logic to ensure no duplicate values exist for a specific key
    within a collection of objects.
    """
    seen = set()
    label = key_label or key

    for entry in entries:
        value = getattr(entry, key, None)
        if value in (None, ""):
            continue
        if value in seen:
            raise ValueError(f"The same {label} cannot appear in multiple entries.")
        seen.add(value)
    return entries
