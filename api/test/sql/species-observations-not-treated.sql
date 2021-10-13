/*
  Query observations that have not been treated this year.
  TODO:
    1. Add geometry to output so we can debug with qGIS.
    2. Strip out the species code join to lower complexity
*/
drop table if exists area_to_treat;
create table area_to_treat as
select
  c.code_description "Species",
  case
    when st_intersects(p1.geom,p2.geom)
    then st_difference(p1.geom,p2.geom)
    else p1.geom
    end "geom"
from
  code c,
  public.activities_by_species p1 left outer join -- Observations
  public.activities_by_species p2 -- Treatments
  on
    st_intersects(p1.geom,p2.geom)
where
  date_part('year', p1.max_created_timestamp) = date_part('year', CURRENT_DATE) and
  p1.species = c.code_name and
  p1.activity_type = 'Observation' and
  p2.activity_type = 'Treatment'  and
  c.code_header_id = 30 and -- Invasive plant id
  p1.species = p2.species and
  p1.max_created_timestamp < p2.max_created_timestamp
;


/**
This worked... But we now need to merge Treatments based on 
an intersection with Observations.
*/
drop table if exists area_to_treat2;
create table area_to_treat2 as
select
  p1.species "Species",
  case
    when st_intersects(p1.geom,p2.geom)
    then st_difference(p1.geom,p2.geom)
    else p1.geom
    end "geom"
from
  (select * from public.activities_by_species where activity_type = 'Observation') p1 left outer join -- Observations
  (select * from public.activities_by_species where activity_type = 'Treatment') p2 -- Treatments
  on
    st_intersects(p2.geom,p1.geom)
;