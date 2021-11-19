
/*
  Species treatment by planning unit.
  TODO: Use IDs to select all treatment records
  then report out treatments.
  According to [this](https://www.postgresql.org/docs/9.1/arrays.html)
  you use the `any` keyword to search in an array
*/
select
  c.code_description "Species",
  public.pest_management_plan_areas.pmp_name "PMP",
  p.activity_ids "IDs", -- Change this
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

/**
 Querying mechanical treatments
 **/
select
  c.code_description "Treatment",
  activity_payload->
    'form_data'->
    'activity_subtype_data'->
    'mechanical_plant_information'->0->
    'invasive_plant_code' "Plant Code"
from
  code c,
  activity_incoming_data
where
  c.code_header_id = ( -- Mechanical Treatment ID
    select
      code_header_id
    from
      code_header
    where
      code_header_name = 'mechanical_method_code'
  ) and
  activity_type = 'Treatment' and -- Treatments only
  activity_payload-> -- There must be a mechanical treatment code
    'form_data'->
    'activity_subtype_data'->
    'mechanical_plant_information'->0 ?
    'invasive_plant_code'
order by
  created_timestamp desc
limit 20
;

-- Find the code
select distinct code_header_name from code_header
order by code_header_name;

