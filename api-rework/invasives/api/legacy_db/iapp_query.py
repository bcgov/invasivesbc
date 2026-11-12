from typing import Iterator

import psycopg
from pydantic import ValidationError
from psycopg.rows import dict_row

from api.legacy_db.iapp_serializer import LegacyIAPPSite
from invasivesbc.settings import LEGACY_DB_CONNECTION_STRING

# language=PostgreSQL
IAPP_SITE_QUERY = """
WITH sites AS (
    SELECT site_id, bool_or(protected) AS protected
    FROM invasivesbc.site_selection_extract
    WHERE %(site_ids)s::int[] IS NULL OR site_id = ANY(%(site_ids)s::int[])
    GROUP BY site_id
), spatial AS (
    SELECT site_id, json_agg(public.st_asgeojson(geog)::jsonb) AS geometries
    FROM invasivesbc.iapp_spatial
    WHERE site_id IN (SELECT site_id FROM sites)
    GROUP BY site_id
), site_selections AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.siteselectionid) AS rows
    FROM invasivesbc.site_selection_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), surveys AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.surveyid) AS rows
    FROM invasivesbc.survey_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), chemical_treatments AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.chemicaltreatmentid) AS rows
    FROM invasivesbc.chemical_treatment_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), chemical_monitorings AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.chemicalmonitoringid) AS rows
    FROM invasivesbc.chemical_monitoring_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), mechanical_treatments AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.mechanicaltreatmentid) AS rows
    FROM invasivesbc.mechanical_treatment_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), mechanical_monitorings AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.mechmonitoringid) AS rows
    FROM invasivesbc.mechanical_monitoring_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), biological_treatments AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.biotreatmentid) AS rows
    FROM invasivesbc.biological_treatment_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), biological_monitorings AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.biologicalmonitoringid) AS rows
    FROM invasivesbc.biological_monitoring_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), biological_dispersals AS (
    SELECT t.site_id, json_agg(to_jsonb(t) ORDER BY t.biologicaldispersalid) AS rows
    FROM invasivesbc.biological_dispersal_extract AS t
    WHERE t.site_id IN (SELECT site_id FROM sites)
    GROUP BY t.site_id
), images AS (
    SELECT m.mapped_site_id AS site_id,
           json_agg(to_jsonb(i) || jsonb_build_object('mapped_site_id', m.mapped_site_id) ORDER BY i.id) AS rows
    FROM invasivesbc.iapp_imported_images AS i
    JOIN invasivesbc.iapp_imported_images_map AS m ON m.imported_image_id = i.id
    WHERE m.mapped_site_id IN (SELECT site_id FROM sites)
    GROUP BY m.mapped_site_id
)
SELECT s.site_id AS site_id,
       s.protected AS protected,
       COALESCE(sp.geometries, '[]'::json) AS geometries,
       COALESCE(ss.rows, '[]'::json) AS site_selections,
       COALESCE(sv.rows, '[]'::json) AS surveys,
       COALESCE(ct.rows, '[]'::json) AS chemical_treatments,
       COALESCE(cm.rows, '[]'::json) AS chemical_monitorings,
       COALESCE(mt.rows, '[]'::json) AS mechanical_treatments,
       COALESCE(mm.rows, '[]'::json) AS mechanical_monitorings,
       COALESCE(bt.rows, '[]'::json) AS biological_treatments,
       COALESCE(bm.rows, '[]'::json) AS biological_monitorings,
       COALESCE(bd.rows, '[]'::json) AS biological_dispersals,
       COALESCE(im.rows, '[]'::json) AS images
FROM sites AS s
LEFT JOIN spatial AS sp ON sp.site_id = s.site_id
LEFT JOIN site_selections AS ss ON ss.site_id = s.site_id
LEFT JOIN surveys AS sv ON sv.site_id = s.site_id
LEFT JOIN chemical_treatments AS ct ON ct.site_id = s.site_id
LEFT JOIN chemical_monitorings AS cm ON cm.site_id = s.site_id
LEFT JOIN mechanical_treatments AS mt ON mt.site_id = s.site_id
LEFT JOIN mechanical_monitorings AS mm ON mm.site_id = s.site_id
LEFT JOIN biological_treatments AS bt ON bt.site_id = s.site_id
LEFT JOIN biological_monitorings AS bm ON bm.site_id = s.site_id
LEFT JOIN biological_dispersals AS bd ON bd.site_id = s.site_id
LEFT JOIN images AS im ON im.site_id = s.site_id
ORDER BY s.site_id
"""


def fetch_iapp_site_rows(
    conn: psycopg.Connection,
    site_ids: list[int] | None = None,
    itersize: int = 500,
) -> Iterator[dict]:
    if itersize < 1:
        raise ValueError("itersize must be greater than zero")

    with conn.cursor(name="iapp_site_rows", row_factory=dict_row) as cursor:
        cursor.itersize = itersize
        cursor.execute(IAPP_SITE_QUERY, {"site_ids": site_ids})
        yield from cursor


def iter_legacy_iapp_sites(
    site_ids: list[int] | None = None,
) -> Iterator[LegacyIAPPSite | tuple[int, ValidationError]]:
    with psycopg.connect(LEGACY_DB_CONNECTION_STRING, row_factory=dict_row) as conn:
        for row in fetch_iapp_site_rows(conn, site_ids):
            site_id = row["site_id"]
            try:
                yield LegacyIAPPSite.model_validate(row)
            except ValidationError as error:
                yield site_id, error
