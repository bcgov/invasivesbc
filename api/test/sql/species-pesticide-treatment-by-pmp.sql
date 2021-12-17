/*
  Need to isolate the following:
  1. Product Name           - herbicide_code??
  2. Active Ingredient
  3. PCP Registration #
  4. Quantity Used Kg.      - amount_of_undiluted_herbicide_used
  5. Area Treated Ha        - area_treated_hectares
  6. Method of Application  - chemical_method_code
  7. Service license        - applicator1_license

  Filtered by
  1. Jurisdiction           - jurisdiction_code
  2. PMP.... or
  3. Custom Layer

*/
-- Sample shape of Vancouver Island
select
  public.st_geomFromGeoJSON(
    '{ "type": "Polygon", "coordinates": [ [ [ -128.594970703125, 50.972264889367494 ], [ -128.551025390625, 50.21909462044748 ], [ -126.221923828125, 48.95858066440977 ], [ -124.53002929687499, 48.44377831058802 ], [ -123.22265625000001, 48.16608541901253 ], [ -123.134765625, 48.777912755501845 ], [ -124.112548828125, 49.50380954152213 ], [ -125.518798828125, 50.41551870402678 ], [ -128.001708984375, 51.069016659603896 ], [ -128.594970703125, 50.972264889367494 ] ] ] }'
  ) "geom"


/**
  Select all chemical treatment IDs
  within our custom shape (VI)
*/
with liquid_herbicide_codes as (
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
        code_header_name = 'liquid_herbicide_code'
    )
),
granular_herbicide_codes as (
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
        code_header_name = 'granular_herbicide_code'
    )
),
custom_shape as (
  select
    public.st_setSRID(
      public.st_geomFromGeoJSON(
        '{ "type": "Polygon", "coordinates": [ [ [ -128.594970703125, 50.972264889367494 ], [ -128.551025390625, 50.21909462044748 ], [ -126.221923828125, 48.95858066440977 ], [ -124.53002929687499, 48.44377831058802 ], [ -123.22265625000001, 48.16608541901253 ], [ -123.134765625, 48.777912755501845 ], [ -124.112548828125, 49.50380954152213 ], [ -125.518798828125, 50.41551870402678 ], [ -128.001708984375, 51.069016659603896 ], [ -128.594970703125, 50.972264889367494 ] ] ] }'
      ), 4326
    ) "geom"
)

select
  p.activity_ids
from
  public.treatments_by_species p join
  custom_shape c on
  public.st_intersects(
    p.geom,public.st_transform(c.geom,3005)
  )
;

/*
  Species chemical treatment by planning unit.
*/
select
  -- TODO: Add the sp and descriptions here
  species_codes.code_description "Species",
  chemical_codes.code_description "Herbicide Type",
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
  -- Where ids match
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
