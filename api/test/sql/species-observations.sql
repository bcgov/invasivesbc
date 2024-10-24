/*
  Simple query of invasive species observation areas
*/
select
  c.code_description "Species",
  round(sum(public.st_area(p.geom))) "Area"
from
  public.activities_by_species p,
  code c
where
  date_part('year', p.max_created_timestamp) = date_part('year', CURRENT_DATE) and
  p.species = c.code_name and
  p.activity_type = 'Observation' and
  c.code_header_id = ( -- Invasive plant id
    select
      code_header_id
    from
      code_header
    where
      code_header_name = 'invasive_plant_code'
  )
group by
  c.code_description
order by
  round(sum(public.st_area(p.geom))) desc
;