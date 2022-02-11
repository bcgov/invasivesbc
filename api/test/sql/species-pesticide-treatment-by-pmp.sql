/*
  Need to isolate the following:
  1. Product Name           - herbicide_code (herbicide_type_code)
  2. Active Ingredient      - herbicide_code (herbicide_type_code)
  3. PCP Registration #     - herbicide_code (herbicide_type_code)
  4. Quantity Used Kg.      - amount_of_undiluted_herbicide_used
  5. Area Treated Ha        - area_treated_hectares
  6. Method of Application  - chemical_application_method_type (chemical_method_code)
  7. Service license        - applicator1_license

  Filtered by
  1. Jurisdiction           - jurisdiction_code
  2. PMP.... or
  3. Custom Layer

*/


/**
  Select all liquid herbicide types
*/
with liquid_herbicides as (
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

/**
  Select all granular herbicide types
*/
granular_herbicides as (
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

/**
  Select the names of chemical treatment types
*/
with herbicide_types as (
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
    )
),

/**
  Select the methods of chemical applications
*/
with chemical_methods as (
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
        code_header_name = 'chemical_method_code'
    )
),

/**
  Select the invasive plant species names
*/
with species as (
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
  Test shape of Vancouver Island. Will be eventually 
  replaced with the Metabase form input variable.
*/
custom_shape as (
  select
    public.st_setSRID(
      public.st_geomFromGeoJSON(
        '{ "type": "Polygon", "coordinates": [ [ [ -128.594970703125, 50.972264889367494 ], [ -128.551025390625, 50.21909462044748 ], [ -126.221923828125, 48.95858066440977 ], [ -124.53002929687499, 48.44377831058802 ], [ -123.22265625000001, 48.16608541901253 ], [ -123.134765625, 48.777912755501845 ], [ -124.112548828125, 49.50380954152213 ], [ -125.518798828125, 50.41551870402678 ], [ -128.001708984375, 51.069016659603896 ], [ -128.594970703125, 50.972264889367494 ] ] ] }'
        -- {{shape}} -- This is for metabase
      ), 4326
    ) "geom"
)

-- select
--   p.activity_ids
-- from
--   public.treatments_by_species p join
--   custom_shape c on
--   public.st_intersects(
--     p.geom,public.st_transform(c.geom,3005)
--   )
-- ;

/**
  Main query to consume all our Common Table Expressions (CTE)
*/
select
  -- TODO: Use a case statement to choose between granular and liquid
  liquid_herbicide.code_description "Liquid Herbicide",
  granular_herbicides.code_description "Granular Herbicide",
  herbicide_types.code_description "Herbicide Type"
  chemical_methods.code_description "Chemical Method",
  species.code_description "Species",
  /**
    If shape is within a boundary.. copy it.
    Otherwise the shape is straddling the shape border
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
  liquid_herbicides and
  granular_herbicides and
  herbicide_types and
  chemical_methods and
  species and
  public.treatments_by_species join
  public.pest_management_plan_areas on
  public.st_intersects(
    treatments_by_species.geom,public.st_transform(
      public.geometry(public.pest_management_plan_areas.geog),
      3005
    )
  )
where
  -- Where ids match
  liquid_herbicides.code_name = treatments_by_species.liquid_herbicide and
  granular_herbicides = treatments_by_species.granular_herbicides and
  herbicide_types = treatments_by_species.herbicide_type and
  chemical_methods = treatments_by_species.chemical_method and
  species = treatments_by_species.species and
  treatments_by_species.activity_subtype = 'Activity_Treatment_ChemicalPlant' and
  -- Only records within a year of today
  date_part('year', treatments_by_species.max_created_timestamp) = date_part('year', CURRENT_DATE) and
  array_length(treatments_by_species.activity_ids,1) > 0 -- ignore records without shapes
  -- and pest_management_plan_areas.pmp_name = 'PMP - South Coast' -- For testing
  [[and {{pmp_name}}]] -- Pest Management Planning Units
  [[and {{jurisdictn}}]] -- Jurisdiction
  [[and {{shape}}]] -- GeoJSON string
group by
  liquid_herbicide.code_description,
  granular_herbicides.code_description,
  herbicide_types.code_description,
  chemical_methods.code_description,
  species.code_description,
  public.pest_management_plan_areas.pmp_name
order by
  public.pest_management_plan_areas.pmp_name
;
