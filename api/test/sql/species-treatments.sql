
/*
  Simple query of invasive species treatments areas
*/
select
  c.code_description "Species",
  round(sum(st_area(p.geom))) "Area"
from
  activities_by_species p,
  code c
where
  p.species = c.code_name and
  p.activity_type = 'Treatment' and
  c.code_header_id = 30 -- Invasive plant id
group by
  c.code_description
order by
  round(sum(st_area(p.geom))) desc
;