/*
  Species observations by planning unit.
  Metabase doesn't support the insertion of 
  table aliases. So if Metabase needs to query against
  an attribute, make sure that you don't use a table
  alias for that attribute.
*/
select
  c.code_description "Species",
  public.regional_invasive_species_organization_areas.agency "Agency",
  round(
    sum(
      public.st_area(
        case
          when public.st_within(p.geom,public.regional_invasive_species_organization_areas.geom)
          then p.geom
          else public.st_intersection(
            p.geom,
            public.st_transform(public.regional_invasive_species_organization_areas.geom,3005)
          )
          end
      )
    )
  ) "Area"
from
  code c,
  public.activities_by_species p join
  public.regional_invasive_species_organization_areas on
  public.st_intersects(p.geom,public.st_transform(public.regional_invasive_species_organization_areas.geom,3005))
where
  date_part('year', p.max_created_timestamp) = date_part('year', CURRENT_DATE) and
  p.species = c.code_name and
  p.activity_type = 'Observation' and
  c.code_header_id = 30 -- Invasive plant id
  [[and {{agent}}]] -- This is for metabase
group by
  c.code_description,
  public.regional_invasive_species_organization_areas.agency
order by
  public.regional_invasive_species_organization_areas.agency
;