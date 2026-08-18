from typing import Any, Dict, List, Union


def distinct_entries(
    arr: List[Dict[str, Any]], unique_keys: List[str], error_message: str
) -> Union[bool, str]:
    """
    Checks for uniqueness based on a specific set of keys.

    :param arr: The list of dictionaries to validate.
    :param unique_keys: The specific keys that, when combined, must be
    unique.
    :param error_message: Human-readable name for the error message.
    :return: True if all non-empty entries are unique; error_message otherwise.
    """
    seen: set[str] = set()

    for entry in arr:
        # Build composite string based on unique keys
        parts: list[str] = []
        for key in unique_keys:
            val = entry.get(key) if isinstance(entry, dict) else None
            # Normalize values to strings, handling None
            parts.append(str(val).strip() if val is not None else "")

        composite_id = "-".join(parts)

        # Skip validation on empty entries
        if composite_id.replace("-", "") == "":
            continue

        if composite_id in seen:
            return error_message

        seen.add(composite_id)

    return True
