from dataclasses import dataclass


@dataclass
class MigrationErrors:
    """Representing the activity-specific list of import errors to be populated during parse/validate/save and then stored by the migration script"""

    errors: list[tuple[str, str | None]]  # list of (reason, status) tuples to be saved
