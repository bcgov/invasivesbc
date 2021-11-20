
/*
  Species treatment by planning unit.
  TODO: Use IDs to select all treatment records
  then report out treatments.
  According to [this](https://www.postgresql.org/docs/9.1/arrays.html)
  you use the `any` keyword to search in an array
*/
select
  c.code_description "Species", -- Species name
  public.pest_management_plan_areas.pmp_name "PMP",
  p.activity_ids "IDs", -- Change this
  /**
    If shape is within a boundary.. copy it.
    Otherwise the shape is straddling the PMP border
    so run an (expensive) intersection
  */
  round(
    sum(
      public.st_area(
        case
          when public.st_within(
            p.geom,
            public.st_transform(
              public.geometry(public.pest_management_plan_areas.geog),
              3005
            )
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
  code c, -- The complete invasives code table
  /**
    This is where the action is!!!
    Run an outer join on the intersection of PMPs and Activities.
    Shapes that intersect (inside, touching or straddling) will
    be sent to the above case statement for the decision as to copy
    or code. Otherwise the treatment just gets copied over.
  */
  public.activities_by_species p join
  public.pest_management_plan_areas on
  public.st_intersects(
    p.geom,public.st_transform(
      public.geometry(public.pest_management_plan_areas.geog),
      3005
    )
  )
where
  -- Only records within a year of today
  date_part('year', p.max_created_timestamp) = date_part('year', CURRENT_DATE) and
  p.species = c.code_name and -- Match code to species
  p.activity_type = 'Treatment' and -- Treatments only
  array_length(p.activity_ids,1) > 0 and -- ignore records without shapes
  c.code_header_id = ( -- Best way to look up the plant code
    select
      code_header_id
    from
      code_header
    where
      code_header_name = 'invasive_plant_code'
  )
  and pest_management_plan_areas.pmp_name = 'PMP - South Coast' -- For testing
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
  sum(st_area(a.geog)) "Area" -- Sum area by meters
from
  code c, -- The code table
  activity_incoming_data a -- Raw data table
where
  c.code_header_id = ( -- Mechanical Treatment ID
    select
      code_header_id
    from
      code_header
    where
      code_header_name = 'mechanical_method_code'
  ) and
  a.activity_payload-> -- The treatment code must mach
    'form_data'->
    'activity_subtype_data'->
    'mechanical_plant_information'->0->>
    'mechanical_method_code' = c.code_name and
  a.activity_type = 'Treatment' and -- Treatments only
  a.activity_payload-> -- There must be a mechanical treatment code
    'form_data'->
    'activity_subtype_data'->
    'mechanical_plant_information'->0 ?
    'invasive_plant_code'
  group by
    c.code_description
;