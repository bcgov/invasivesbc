/*
  Species observations by planning unit.
  Metabase doesn't support the insertion of 
  table aliases. So if Metabase needs to query against
  an attribute, make sure that you don't use a table
  alias for that attribute.
*/
select
  c.code_description "Species",
  public.pest_management_plan_areas.pmp_name "PMP",
  round(
    sum(
      public.st_area(
        case
          when public.st_within(
            p.geom,
            public.geometry(public.pest_management_plan_areas.geog)
          )
          then p.geom
          else public.st_intersection(
            p.geom,
            public.st_transform(
              public.geometry(public.pest_management_plan_areas.geog),
              3005
            )
          )
          end
      )
    )
  ) "Area"
from
  code c,
  public.activities_by_species p join
  public.pest_management_plan_areas on
  public.st_intersects(
    p.geom,public.st_transform(
      public.geometry(public.pest_management_plan_areas.geog),
      3005
    )
  )
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
  [[and {{pmp_name}}]] -- This is for metabase
  -- and pest_management_plan_areas.pmp_name = 'PMP - South Coast' -- For testing

group by
  c.code_description,
  public.pest_management_plan_areas.pmp_name
order by
  public.pest_management_plan_areas.pmp_name
;