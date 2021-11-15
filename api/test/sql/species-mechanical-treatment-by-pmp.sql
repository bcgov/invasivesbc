
/*
  Species treatment by planning unit.
  TODO: Use IDs to select all treatment records
  then report out treatments.
*/
select
  c.code_description "Species",
  public.pest_management_plan_areas.pmp_name "PMP",
  p.activity_ids "IDs",
  round(
    sum(
      public.st_area(
        case
          when public.st_within(p.geom,public.pest_management_plan_areas.wkb_geometry)
          then p.geom
          else public.st_intersection(
            p.geom,
            public.st_transform(public.pest_management_plan_areas.wkb_geometry,3005)
          )
          end
      )
    )
  ) "Area"
from
  code c,
  public.activities_by_species p join
  public.pest_management_plan_areas on
  public.st_intersects(p.geom,public.st_transform(public.pest_management_plan_areas.wkb_geometry,3005))
where
  date_part('year', p.max_created_timestamp) = date_part('year', CURRENT_DATE) and
  p.species = c.code_name and
  p.activity_type = 'Treatment' and
  c.code_header_id = ( -- Invasive plant id
    select
      code_header_id
    from
      code_header
    where
      code_header_name = 'invasive_plant_code'
  )
  and pest_management_plan_areas.pmp_name = 'PMP - South Coast'
--   [[and {{pmp_name}}]] -- This is for metabase
group by
  c.code_description,
  p.activity_ids,
  public.pest_management_plan_areas.pmp_name
order by
  public.pest_management_plan_areas.pmp_name
;