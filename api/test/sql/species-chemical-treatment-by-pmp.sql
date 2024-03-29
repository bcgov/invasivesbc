

/**
  Select all species IDs
  with their descriptions
*/
with species_codes as (
  select
    code_name,
    code_description
  from
    code
  where
    code_header_id = (
      select
        code_header_id
      from
        code_header
      where
        code_header_name = 'invasive_plant_code'
    )
),

/**
  Select all chemical treatment IDs
  with their descriptions
*/
chemical_codes as (
  select
    code_name,
    code_description
  from
    code
  where
    code_header_id = (
      select
        code_header_id
      from
        code_header
      where
        code_header_name = 'herbicide_type_code'
        -- code_header_name = 'chemical_method_code'
    )
)

/*
  Species chemical treatment by planning unit.
*/
select
  -- TODO: Add the sp and descriptions here
  species_codes.code_description "Species",
  chemical_codes.code_description "Herbicide Type",
  -- p.species "Species", -- Species name
  -- p.activity_ids "IDs", -- Change this
  -- p.method,
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
  /**
    This is where the action is!!!
    Run an outer join on the intersection of PMPs and Activities.
    Shapes that intersect (inside, touching or straddling) will
    be sent to the above case statement for the decision as to copy
    or clip. Otherwise the treatment just gets copied over.:
  */
  chemical_codes,
  species_codes,
  public.treatments_by_species p join
  public.pest_management_plan_areas on
  public.st_intersects(
    p.geom,public.st_transform(
      public.geometry(public.pest_management_plan_areas.geog),
      3005
    )
  )
where
  -- TODO: Where ids match
  species_codes.code_name = p.species and
  chemical_codes.code_name = p.method and
  p.activity_subtype = 'Activity_Treatment_ChemicalPlant' and
  -- Only records within a year of today
  date_part('year', p.max_created_timestamp) = date_part('year', CURRENT_DATE) and
  array_length(p.activity_ids,1) > 0 -- ignore records without shapes
  and pest_management_plan_areas.pmp_name = 'PMP - South Coast' -- For testing
  -- [[and {{pmp_name}}]] -- This is for metabase
group by
  species_codes.code_description,
  chemical_codes.code_description,
  p.species,
  p.activity_ids,
  p.method,
  public.pest_management_plan_areas.pmp_name
order by
  public.pest_management_plan_areas.pmp_name
;