select
	species "Species Code",
  round(sum(st_area(geom))) "Area",
  activity_ids
from
  test_spatial_merge
group by
  species,
  ids
;