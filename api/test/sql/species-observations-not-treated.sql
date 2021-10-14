/** Query observations that have not been treated this year.
  Requirements:
  1. Species for Treatments and Observations must match.
  2. Treatments must proceed Observations.
  3. Must occur in the current calendar year.
*/
drop table if exists area_to_treat;
create table area_to_treat as
select
  c.code_description "Species", -- Species name
  case -- Geometry conditional subtractions
    when st_intersects(p1.geom,p2.geom) -- If treatment overlaps observation
    then st_difference(p1.geom,p2.geom) -- Subtract the treatment area from observations
    else p1.geom -- Otherwise allow the observation to pass through
    end "geom"
from
  code c, -- The code to species name table
  ( -- Select observations
    select
      *
    from
      public.activities_by_species
    where
      activity_type = 'Observation'
  ) p1 left outer join
  /**
    Outer Join so observations that don't touch treatments
    still make it through to be counted
  **/
  ( -- Select treatments
    select
      i1.species "species", 
      st_union(i1.geom) "geom", -- Merge treatments touching the same observations
      max(i1.max_created_timestamp) "max_created_timestamp"
    from
      public.activities_by_species i1, -- For Treatments
      public.activities_by_species i2  -- For Observations
    where
      i1.activity_type = 'Treatment' and
      i2.activity_type = 'Observation' and
      st_intersects(i2.geom,i1.geom) and -- Where treatments touch an observations
      i1.species = i2.species
    group by
      i1.species
  ) p2
  on
    st_intersects(p2.geom,p1.geom) and -- Where treatments touch observations
    p1.species = p2.species and -- Same species
    p1.max_created_timestamp < p2.max_created_timestamp -- observation older then treatment
where
  c.code_header_id = 30 and -- Invasive plant id
  p1.species = c.code_name and
  date_part('year', p1.max_created_timestamp) = date_part('year', CURRENT_DATE)
;