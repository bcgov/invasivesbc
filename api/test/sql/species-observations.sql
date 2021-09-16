/*
  Simple query of invasive species observation areas
*/
select
	p.species "Species Code",
  c.code_description "Species",
  round(sum(st_area(p.geom))) "Area",
  p.activity_ids
from
  test_spatial_merge p,
  code c
where
  p.species = c.code_name and
  c.code_header_id = 30 -- Invasive plant id
group by
  p.species,
  c.code_description,
  p.activity_ids
order by
  round(sum(st_area(p.geom))) desc
;