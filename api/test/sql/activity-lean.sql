select
	jsonb_build_object (
    'type', 'Feature',
    'properties', json_build_object(
      'activity_id', activity_id,
      'activity_type', activity_type,
      'activity_subtype', activity_subtyp
    ),
    'geometry', st_asGeoJSON(geog)::jsonb
  ) as "geojson"
from
  invasivesbc.activity_incoming_data
where
  activity_id = '01efdd76-56fb-44b5-b7dc-6c50587d00ef'
;