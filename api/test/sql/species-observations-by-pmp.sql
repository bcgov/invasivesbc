/*
  Simple query of invasive species observation areas
*/
select
  c.code_description "Species",
  r.agency "Agency",
  round(
    sum(
      public.st_area(
        case
          when public.st_within(p.geom,r.geom)
          then p.geom
          else public.st_intersection(
            p.geom,
            public.st_transform(r.geom,3005)
          )
          end
      )
    )
  ) "Area"
from
  code c,
  public.activities_by_species p join
  public.regional_invasive_species_organization_areas r on
  public.st_intersects(p.geom,public.st_transform(r.geom,3005))
where
  date_part('year', p.max_created_timestamp) = date_part('year', CURRENT_DATE) and
  p.species = c.code_name and
  p.activity_type = 'Observation' and
  c.code_header_id = 30 -- Invasive plant id
  [[and r.agent = {{agent}}]] -- TODO: Still debugging this
group by
  c.code_description,
  r.agency
order by
  r.agency
;