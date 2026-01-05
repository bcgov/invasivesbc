import logging
from dataclasses import dataclass
from typing import Optional, Literal
from pydantic_core._pydantic_core import ValidationError
from rich.pretty import pprint

import psycopg
from psycopg.rows import dict_row

from api.legacy_db.model_serializer import LegacyActivity

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("psycopg").setLevel(logging.DEBUG)

log = logging.getLogger("legacy-import")

CONNECTION_STRING = "dbname=invasives host=localhost user=invasivesbc password=devdevdev"

@dataclass
class MigrationRunStatistics:
  source: str
  attempted: int = 0
  succeeded: int = 0
  failed_for_any_reason: int = 0
  failed_parse: int = 0
  failed_translate: int = 0
  failed_validate: int = 0

class LegacyDB:
  def __init__(self):
    pass

  @staticmethod
  def migrate_activities(dry_run=False, source: Literal["all", "previously-failed", "random-sample", "list"] = 'all'):
    stats = MigrationRunStatistics(source=source)

    sourcing_query = ""

    match source:
      case "all":
        sourcing_query = f"select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted'"
      case "random-sample":
        sourcing_query = f"select activity_id, activity_type, activity_subtype, activity_payload from invasivesbc.activity_incoming_data where iscurrent=true and activity_payload->>'form_status' like 'Submitted' and random() >= 0.95"

    with psycopg.connect(CONNECTION_STRING, row_factory=dict_row) as conn:
      with conn.cursor() as cursor:
        result = cursor.execute(sourcing_query)
        for row in result.fetchall():
          stats.attempted += 1
          try:
            parsed_activity = LegacyActivity.model_validate(row, extra='forbid')
            if not dry_run:
              pass
              # migrate(parsed_activity)
            stats.succeeded += 1
          except ValidationError:
            log.warning(f'initial parse for {row['activity_id']} failed', exc_info=True)
            stats.failed_for_any_reason += 1
            stats.failed_parse += 1

        return stats

