import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    create or replace view observations_by_species as (
    with spatial_expload_positive as (
      select     activity_type,
        activity_subtype,
        created_timestamp,
        activity_incoming_data_id,
        jsonb_array_elements(species_positive) "species", -- Explode species
        st_makevalid(geometry(geog)) "geom" -- Convert to Geometry (EPSG:4326)
      from
        activity_incoming_data
      where
        activity_type = 'Observation' and -- Observations for now
        form_status = 'Submitted' and 
        activity_incoming_data_id in (select incoming_data_id from activity_current) and
        species_positive is not null and 
        species_positive::text not like '[null]'::text and 
        species_positive::text not like 'null'::text
      ), spatial_positive as (
      select activity_type,
             activity_subtype,
             created_timestamp,
             activity_incoming_data_id,
             species,
             case 
             when st_geometrytype(geom) = 'ST_Point'
             then st_buffer(geom::geography, 0.56425, 'quad_segs=30')::geometry
             else geom  
             end
             
             from spatial_expload_positive 
             ),
      spatial_expload_negative as (
      select 
        activity_subtype,
        created_timestamp,
        activity_incoming_data_id,
        jsonb_array_elements(species_negative) "species",
        st_makevalid(geometry(geog)) "geom"
      from
        activity_incoming_data
      where
        activity_type = 'Observation' and
        form_status = 'Submitted' and 
        activity_incoming_data_id in (select incoming_data_id from activity_current) and
        species_negative is not null and 
        species_negative::text not like '[null]'::text and 
        species_negative::text not like 'null'::text
      ), spatial_negative as (
        select activity_subtype,
               created_timestamp,
               activity_incoming_data_id,
               species,
               case 
               when st_geometrytype(geom) = 'ST_Point' -- when geometry is a point turn it into a circle with area 1m2
               then st_buffer(geom::geography, 0.56425, 'quad_segs=30')::geometry
               else geom  
               end
             
               from spatial_expload_negative
             ),
       spatial_positive_negative as ( -- this CTE creates a new polygon everytime a negative overlaps an older positive, the next two CTEs remove the unwanted extra polygons 
    select
      row_number() over() as ctid,
      pos.species #>> '{}' "species",
      pos.activity_type,
      pos.created_timestamp,
      pos.activity_incoming_data_id,
      case  -- If there is overlap, delete, otherwise pass through
        when st_intersects(pos.geom,neg.geom)
        then st_difference(pos.geom,neg.geom)
        else pos.geom
        end
    from
      spatial_positive pos left outer join -- This allows the pass through
      spatial_negative neg
      on
        st_intersects(pos.geom,neg.geom) and
        pos.species = neg.species and
        pos.created_timestamp < neg.created_timestamp -- Only delete new negatives
    ),
    spatial_full_overlap as ( -- where one or more polygons are within a polygon with the same id/species: select the smallest polygon
    select t.activity_incoming_data_id,
           t.species, 
           st_area(t.geom, true) as area,
           t.geom,   
           t.created_timestamp,
           t.activity_type
           
    from spatial_positive_negative t
       inner join 
       (
    SELECT a.activity_incoming_data_id, min(st_area(a.geom, true)) as area
    FROM spatial_positive_negative a, spatial_positive_negative b 
    where a.species = b.species and 
    ST_contains(a.geom, b.geom) and 
    a.ctid != b.ctid and 
    a.activity_incoming_data_id = b.activity_incoming_data_id
    group by a.activity_incoming_data_id
       ) m
       on t.activity_incoming_data_id = m.activity_incoming_data_id
    where st_area(t.geom, true) = m.area        
    ),
     spatial_partial_overlap as ( -- where one or more polygons with the same id/species intersect but none are fully within another: select the intersecting area of those polygons
    SELECT a.activity_incoming_data_id, 
           a.species, 
           st_intersection(a.geom, b.geom) as geom,
           a.created_timestamp,
           a.activity_type
           
    FROM spatial_positive_negative a, spatial_positive_negative b 
    where a.species = b.species and 
    ST_intersects(a.geom, b.geom) and 
    a.ctid != b.ctid and 
    a.activity_incoming_data_id = b.activity_incoming_data_id and 
    a.activity_incoming_data_id not in (
    SELECT a.activity_incoming_data_id
    FROM spatial_positive_negative a, spatial_positive_negative b 
    where a.species = b.species and 
    ST_contains(a.geom, b.geom) and 
    a.ctid != b.ctid and 
    a.activity_incoming_data_id = b.activity_incoming_data_id
    group by a.activity_incoming_data_id
    )
    group by a.activity_incoming_data_id,
             a.species,
             a.geom,
             b.geom,
             a.created_timestamp,
             a.activity_type
    ),
      spatial_others as ( -- select all polygons that don't meet the criteria of the last two CTEs and union with those CTEs
    SELECT activity_incoming_data_id,
           species,
           geom,
           created_timestamp,
           activity_type 
           
    FROM spatial_positive_negative
    where activity_incoming_data_id not in
    (
    SELECT a.activity_incoming_data_id
    FROM spatial_positive_negative a, spatial_positive_negative b 
    where a.species = b.species and 
    ST_intersects(a.geom, b.geom) and 
    a.ctid != b.ctid and 
    a.activity_incoming_data_id = b.activity_incoming_data_id
    group by a.activity_incoming_data_id
    ) 
    
    union 
    
    select activity_incoming_data_id,
           species,
           geom,
           created_timestamp,
           activity_type
           
    from spatial_full_overlap 
    
    union 
    
    select * from spatial_partial_overlap
    ), spatial_union as ( -- union positive polygons by id/species to not double count area of overlap
    
    select
      species,
      invasive_plant_codes.code_description as terrestrial_invasive_plant,
      invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant,
      activity_type,
      max(created_timestamp) "max_created_timestamp",
      array_agg(activity_incoming_data_id) "activity_ids", -- Collect original IDs 
      st_Union( -- Remove embedded linework
        st_collectionExtract( -- Convert from GeometryCollection to MultiPolygons
              st_transform(geom,3005) -- Convert to Albers to get meters
        ,3)
      ) "geom"
    from
      spatial_others
    
    left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
    and invasive_plant_code_header.valid_to is null 
    left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
    and species = invasive_plant_codes.code_name  
      
    left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
    and invasive_plant_aquatic_code_header.valid_to is null 
    left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
    and species = invasive_plant_aquatic_codes.code_name
    
    group by
      species,
      invasive_plant_codes.code_description,
      invasive_plant_aquatic_codes.code_description,
      activity_type
      )
      select species,
             coalesce(terrestrial_invasive_plant, aquatic_invasive_plant) as invasive_plant,
             st_area(geom) as area_sqm,         
             max_created_timestamp,
             geom
    
             from spatial_union 
    
             where st_area(geom) > 0 -- don't select empty polygons
             
    );
    
    create 
    or replace view current_positive_observations as (
      with spatial_explode_positive as (
        select 
          activity_type, 
          activity_subtype, 
          created_timestamp, 
          activity_incoming_data_id, 
          jsonb_array_elements(species_positive) "species", 
          -- Explode species
          st_makevalid(geometry(geog)) "geom" -- Convert to Geometry (EPSG:4326)
        from 
          activity_incoming_data 
        where 
          activity_type = 'Observation' 
          and -- Observations for now
          form_status = 'Submitted' 
          and activity_incoming_data_id in (
            select 
              incoming_data_id 
            from 
              activity_current
          ) 
          and species_positive is not null 
          and species_positive :: text not like '[null]' :: text 
          and species_positive :: text not like 'null' :: text
      ), 
      spatial_positive as (
        select 
          activity_type, 
          activity_subtype, 
          created_timestamp, 
          activity_incoming_data_id, 
          species, 
          case when st_geometrytype(geom) = 'ST_Point' then st_buffer(
            geom :: geography, 0.56425, 'quad_segs=30'
          ):: geometry else geom end 
        from 
          spatial_explode_positive
      ), 
      spatial_explode_negative as (
        select 
          activity_subtype, 
          created_timestamp, 
          activity_incoming_data_id, 
          jsonb_array_elements(species_negative) "species", 
          st_makevalid(geometry(geog)) "geom" 
        from 
          activity_incoming_data 
        where 
          activity_type = 'Observation' 
          and form_status = 'Submitted' 
          and activity_incoming_data_id in (
            select 
              incoming_data_id 
            from 
              activity_current
          ) 
          and species_negative is not null 
          and species_negative :: text not like '[null]' :: text 
          and species_negative :: text not like 'null' :: text
      ), 
      spatial_negative as (
        select 
          activity_subtype, 
          created_timestamp, 
          activity_incoming_data_id, 
          species, 
          case when st_geometrytype(geom) = 'ST_Point' -- when geometry is a point turn it into a circle with area 1m2
          then st_buffer(
            geom :: geography, 0.56425, 'quad_segs=30'
          ):: geometry else geom end 
        from 
          spatial_explode_negative
      ), 
      spatial_positive_negative as (
        -- this CTE creates a new polygon everytime a negative overlaps an older positive, the next two CTEs remove the unwanted extra polygons 
        select 
          row_number() over() as ctid, 
          pos.species #>> '{}' "species",
          pos.activity_type, 
          pos.created_timestamp, 
          pos.activity_incoming_data_id, 
          case -- If there is overlap, delete, otherwise pass through
          when st_intersects(pos.geom, neg.geom) then st_difference(pos.geom, neg.geom) else pos.geom end 
        from 
          spatial_positive pos 
          left outer join -- This allows the pass through
          spatial_negative neg on st_intersects(pos.geom, neg.geom) 
          and pos.species = neg.species 
          and pos.created_timestamp < neg.created_timestamp -- Only delete new negatives
          ), 
      spatial_full_overlap as (
        -- where one or more polygons are within a polygon with the same id/species: select the smallest polygon
        select 
          t.activity_incoming_data_id, 
          t.species, 
          st_area(t.geom, true) as area, 
          t.geom, 
          t.created_timestamp, 
          t.activity_type 
        from 
          spatial_positive_negative t 
          inner join (
            SELECT 
              a.activity_incoming_data_id, 
              min(
                st_area(a.geom, true)
              ) as area 
            FROM 
              spatial_positive_negative a, 
              spatial_positive_negative b 
            where 
              a.species = b.species 
              and ST_contains(a.geom, b.geom) 
              and a.ctid != b.ctid 
              and a.activity_incoming_data_id = b.activity_incoming_data_id 
            group by 
              a.activity_incoming_data_id
          ) m on t.activity_incoming_data_id = m.activity_incoming_data_id 
        where 
          st_area(t.geom, true) = m.area
      ), 
      spatial_partial_overlap as (
        -- where one or more polygons with the same id/species intersect but none are fully within another: select the intersecting area of those polygons
        SELECT 
          a.activity_incoming_data_id, 
          a.species, 
          st_intersection(a.geom, b.geom) as geom, 
          a.created_timestamp, 
          a.activity_type 
        FROM 
          spatial_positive_negative a, 
          spatial_positive_negative b 
        where 
          a.species = b.species 
          and ST_intersects(a.geom, b.geom) 
          and a.ctid != b.ctid 
          and a.activity_incoming_data_id = b.activity_incoming_data_id 
          and a.activity_incoming_data_id not in (
            SELECT 
              a.activity_incoming_data_id 
            FROM 
              spatial_positive_negative a, 
              spatial_positive_negative b 
            where 
              a.species = b.species 
              and ST_contains(a.geom, b.geom) 
              and a.ctid != b.ctid 
              and a.activity_incoming_data_id = b.activity_incoming_data_id 
            group by 
              a.activity_incoming_data_id
          ) 
        group by 
          a.activity_incoming_data_id, 
          a.species, 
          a.geom, 
          b.geom, 
          a.created_timestamp, 
          a.activity_type
      ), 
      spatial_others as (
        -- select all polygons that don't meet the criteria of the last two CTEs and union with those CTEs
        SELECT 
          activity_incoming_data_id, 
          species, 
          geom, 
          created_timestamp, 
          activity_type 
        FROM 
          spatial_positive_negative 
        where 
          activity_incoming_data_id not in (
            SELECT 
              a.activity_incoming_data_id 
            FROM 
              spatial_positive_negative a, 
              spatial_positive_negative b 
            where 
              a.species = b.species 
              and ST_intersects(a.geom, b.geom) 
              and a.ctid != b.ctid 
              and a.activity_incoming_data_id = b.activity_incoming_data_id 
            group by 
              a.activity_incoming_data_id
          ) 
        union 
        select 
          activity_incoming_data_id, 
          species, 
          geom, 
          created_timestamp, 
          activity_type 
        from 
          spatial_full_overlap 
        union 
        select 
          * 
        from 
          spatial_partial_overlap
      ), 
      coalesce_invasive_plant as (
        select 
          o.activity_incoming_data_id, 
          o.species as species_code, 
          coalesce(
            invasive_plant_codes.code_description, 
            invasive_plant_aquatic_codes.code_description
          ) as invasive_plant, 
          invasive_plant_codes.code_description as terrestrial_invasive_plant, 
          invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant, 
          o.geom, 
          o.created_timestamp 
        from 
          spatial_others o 
          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
          and invasive_plant_code_header.valid_to is null 
          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
          and species = invasive_plant_codes.code_name 
          left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
          and invasive_plant_aquatic_code_header.valid_to is null 
          left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
          and species = invasive_plant_aquatic_codes.code_name 
        where 
          st_area(geom) > 0
      ) 
      select 
        activity_incoming_data_id, 
        species_code, 
        concat(
          activity_incoming_data_id, '-', species_code
        ) id_species, 
        invasive_plant,
        geom, 
        created_timestamp 
      from 
        coalesce_invasive_plant
    );
    
    create or replace view current_negative_observations as (
    with spatial_explode_negative as (
      select     activity_type,
        activity_subtype,
        created_timestamp,
        activity_incoming_data_id,
        jsonb_array_elements(species_negative) "species", -- Explode species
        st_makevalid(geometry(geog)) "geom" -- Convert to Geometry (EPSG:4326)
      from
        activity_incoming_data
      where
        activity_type = 'Observation' and -- Observations for now
        form_status = 'Submitted' and 
        activity_incoming_data_id in (select incoming_data_id from activity_current) and
        species_negative is not null and 
        species_negative::text not like '[null]'::text and
        species_negative::text not like 'null'::text
      ), spatial_negative as (
      select activity_type,
             activity_subtype,
             created_timestamp,
             activity_incoming_data_id,
             species,
             case 
             when st_geometrytype(geom) = 'ST_Point'
             then st_buffer(geom::geography, 0.56425, 'quad_segs=30')::geometry
             else geom  
             end
             
             from spatial_explode_negative
             ),
      spatial_explode_positive as (
      select 
        activity_subtype,
        created_timestamp,
        activity_incoming_data_id,
        jsonb_array_elements(species_positive) "species",
        st_makevalid(geometry(geog)) "geom"
      from
        activity_incoming_data
      where
        activity_type = 'Observation' and
        form_status = 'Submitted' and 
        activity_incoming_data_id in (select incoming_data_id from activity_current) and
        species_positive is not null and 
        species_positive::text not like '[null]'::text and 
        species_positive::text not like 'null'::text
        
      ), spatial_positive as (
        select activity_subtype,
               created_timestamp,
               activity_incoming_data_id,
               species,
               case 
               when st_geometrytype(geom) = 'ST_Point' -- when geometry is a point turn it into a circle with area 1m2
               then st_buffer(geom::geography, 0.56425, 'quad_segs=30')::geometry
               else geom  
               end
             
               from spatial_explode_positive
             ),
       spatial_positive_negative as ( -- this CTE creates a new polygon everytime a negative overlaps an older positive, the next two CTEs remove the unwanted extra polygons 
    select
      row_number() over() as ctid,
      neg.species #>> '{}' "species",
      neg.activity_type,
      neg.created_timestamp,
      neg.activity_incoming_data_id,
      case  -- If there is overlap, delete, otherwise pass through
        when st_intersects(neg.geom,pos.geom)
        then st_difference(neg.geom,pos.geom)
        else neg.geom
        end
    from
      spatial_negative neg left outer join -- This allows the pass through
      spatial_positive pos
      on
        st_intersects(neg.geom,pos.geom) and
        neg.species = pos.species and
        neg.created_timestamp < pos.created_timestamp -- Only delete new positives
    ),
    spatial_full_overlap as ( -- where one or more polygons are within a polygon with the same id/species: select the smallest polygon
    select t.activity_incoming_data_id,
           t.species, 
           st_area(t.geom, true) as area,
           t.geom,   
           t.created_timestamp,
           t.activity_type
           
    from spatial_positive_negative t
       inner join 
       (
    SELECT a.activity_incoming_data_id, min(st_area(a.geom, true)) as area
    FROM spatial_positive_negative a, spatial_positive_negative b 
    where a.species = b.species and 
    ST_contains(a.geom, b.geom) and 
    a.ctid != b.ctid and 
    a.activity_incoming_data_id = b.activity_incoming_data_id
    group by a.activity_incoming_data_id
       ) m
       on t.activity_incoming_data_id = m.activity_incoming_data_id
    where st_area(t.geom, true) = m.area        
    ),
     spatial_partial_overlap as ( -- where one or more polygons with the same id/species intersect but none are fully within another: select the intersecting area of those polygons
    SELECT a.activity_incoming_data_id, 
           a.species, 
           st_intersection(a.geom, b.geom) as geom,
           a.created_timestamp,
           a.activity_type
           
    FROM spatial_positive_negative a, spatial_positive_negative b 
    where a.species = b.species and 
    ST_intersects(a.geom, b.geom) and 
    a.ctid != b.ctid and 
    a.activity_incoming_data_id = b.activity_incoming_data_id and 
    a.activity_incoming_data_id not in (
    SELECT a.activity_incoming_data_id
    FROM spatial_positive_negative a, spatial_positive_negative b 
    where a.species = b.species and 
    ST_contains(a.geom, b.geom) and 
    a.ctid != b.ctid and 
    a.activity_incoming_data_id = b.activity_incoming_data_id
    group by a.activity_incoming_data_id
    )
    group by a.activity_incoming_data_id,
             a.species,
             a.geom,
             b.geom,
             a.created_timestamp,
             a.activity_type
    ),
      spatial_others as ( -- select all polygons that don't meet the criteria of the last two CTEs and union with those CTEs
    SELECT activity_incoming_data_id,
           species,
           geom,
           created_timestamp,
           activity_type 
           
    FROM spatial_positive_negative
    where activity_incoming_data_id not in
    (
    SELECT a.activity_incoming_data_id
    FROM spatial_positive_negative a, spatial_positive_negative b 
    where a.species = b.species and 
    ST_intersects(a.geom, b.geom) and 
    a.ctid != b.ctid and 
    a.activity_incoming_data_id = b.activity_incoming_data_id
    group by a.activity_incoming_data_id
    ) 
    
    union 
    
    select activity_incoming_data_id,
           species,
           geom,
           created_timestamp,
           activity_type
           
    from spatial_full_overlap 
    
    union 
    
    select * from spatial_partial_overlap
    ),  coalesce_invasive_plant as (
        select 
          o.activity_incoming_data_id, 
          o.species as species_code, 
          coalesce(
            invasive_plant_codes.code_description, 
            invasive_plant_aquatic_codes.code_description
          ) as invasive_plant, 
          invasive_plant_codes.code_description as terrestrial_invasive_plant, 
          invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant, 
          o.geom, 
          o.created_timestamp 
        from 
          spatial_others o 
          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
          and invasive_plant_code_header.valid_to is null 
          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
          and species = invasive_plant_codes.code_name 
          left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
          and invasive_plant_aquatic_code_header.valid_to is null 
          left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
          and species = invasive_plant_aquatic_codes.code_name 
        where 
          st_area(geom) > 0
      ) 
      select 
        activity_incoming_data_id, 
        species_code, 
        concat(
          activity_incoming_data_id, '-', species_code
        ) id_species, 
        invasive_plant,
        geom, 
        created_timestamp 
      from 
        coalesce_invasive_plant
             
    );
    
    create 
    or replace view jurisdiction_species as (
      with spatial_expload_positive as (
        select 
          activity_type, 
          activity_subtype, 
          created_timestamp, 
          activity_incoming_data_id,
          regional_districts,
          regional_invasive_species_organization_areas, 
          jsonb_array_elements(species_positive) "species", 
          -- Explode species
          jsonb_array_elements(
            activity_payload #> '{form_data, activity_data, jurisdictions}') as jurisdictions_array,
            st_makevalid(geometry(geog)) "geom" -- Convert to Geometry (EPSG:4326)
            from 
              activity_incoming_data 
            where 
              activity_type = 'Observation' 
              and -- Observations for now
              form_status = 'Submitted' 
              and activity_incoming_data_id in (
                select 
                  incoming_data_id 
                from 
                  activity_current
              ) 
              and species_positive is not null 
              and species_positive :: text not like '[null]' :: text and 
              species_positive :: text not like 'null' :: text
          ), 
          spatial_positive as (
            select 
              activity_type, 
              activity_subtype, 
              created_timestamp, 
              activity_incoming_data_id,
              regional_districts,
              regional_invasive_species_organization_areas,
              species, 
              jurisdictions_array #>> '{jurisdiction_code}' as jurisdiction_code,
              jurisdictions_array #>> '{percent_covered}' as percent_covered,
              case when st_geometrytype(geom) = 'ST_Point' then st_buffer(
                geom :: geography, 0.56425, 'quad_segs=30'
              ):: geometry else geom end 
            from 
              spatial_expload_positive
          ), 
          spatial_expload_negative as (
            select 
              activity_subtype, 
              created_timestamp, 
              activity_incoming_data_id, 
              jsonb_array_elements(species_negative) "species", 
                st_makevalid(geometry(geog)) "geom" 
                from 
                  activity_incoming_data 
                where 
                  activity_type = 'Observation' 
                  and form_status = 'Submitted' 
                  and activity_incoming_data_id in (
                    select 
                      incoming_data_id 
                    from 
                      activity_current
                  ) 
                  and species_negative is not null 
                  and species_negative :: text not like '[null]' :: text and 
                  species_negative :: text not like 'null' :: text
              ), 
              spatial_negative as (
                select 
                  activity_subtype, 
                  created_timestamp, 
                  activity_incoming_data_id, 
                  species, 
                  case when st_geometrytype(geom) = 'ST_Point' -- when geometry is a point turn it into a circle with area 1m2
                  then st_buffer(
                    geom :: geography, 0.56425, 'quad_segs=30'
                  ):: geometry else geom end 
                from 
                  spatial_expload_negative
              ), 
              spatial_positive_negative as (
                -- this CTE creates a new polygon everytime a negative overlaps an older positive, the next two CTEs remove the unwanted extra polygons 
                select 
                  row_number() over() as ctid, 
                  pos.species #>> '{}' "species",
                  pos.jurisdiction_code, 
                  pos.percent_covered, 
                  pos.activity_type, 
                  pos.created_timestamp, 
                  pos.activity_incoming_data_id, 
                  pos.regional_districts,
                  pos.regional_invasive_species_organization_areas,
                  case -- If there is overlap, delete, otherwise pass through
                  when st_intersects(pos.geom, neg.geom) then st_difference(pos.geom, neg.geom) else pos.geom end 
                from 
                  spatial_positive pos 
                  left outer join -- This allows the pass through
                  spatial_negative neg on st_intersects(pos.geom, neg.geom) 
                  and pos.species = neg.species 
                  and pos.created_timestamp < neg.created_timestamp -- Only delete new negatives
                  ), 
              spatial_full_overlap as (
                -- where one or more polygons are within a polygon with the same id/species: select the smallest polygon
                select 
                  t.activity_incoming_data_id, 
                  t.species, 
                  t.regional_districts,
                  t.regional_invasive_species_organization_areas,
                  t.jurisdiction_code, 
                  t.percent_covered, 
                  st_area(t.geom, true) as area, 
                  t.geom, 
                  t.created_timestamp, 
                  t.activity_type 
                from 
                  spatial_positive_negative t 
                  inner join (
                    SELECT 
                      a.activity_incoming_data_id, 
                      min(
                        st_area(a.geom, true)
                      ) as area 
                    FROM 
                      spatial_positive_negative a, 
                      spatial_positive_negative b 
                    where 
                      a.species = b.species 
                      and ST_contains(a.geom, b.geom) 
                      and a.ctid != b.ctid 
                      and a.activity_incoming_data_id = b.activity_incoming_data_id 
                    group by 
                      a.activity_incoming_data_id
                  ) m on t.activity_incoming_data_id = m.activity_incoming_data_id 
                where 
                  st_area(t.geom, true) = m.area
              ), 
              spatial_partial_overlap as (
                -- where one or more polygons with the same id/species intersect but none are fully within another: select the intersecting area of those polygons
                SELECT 
                  a.activity_incoming_data_id, 
                  a.species, 
                  a.regional_districts,
                  a.regional_invasive_species_organization_areas,
                  a.jurisdiction_code, 
                  a.percent_covered, 
                  st_intersection(a.geom, b.geom) as geom, 
                  a.created_timestamp, 
                  a.activity_type 
                FROM 
                  spatial_positive_negative a, 
                  spatial_positive_negative b 
                where 
                  a.species = b.species 
                  and ST_intersects(a.geom, b.geom) 
                  and a.ctid != b.ctid 
                  and a.activity_incoming_data_id = b.activity_incoming_data_id 
                  and a.activity_incoming_data_id not in (
                    SELECT 
                      a.activity_incoming_data_id 
                    FROM 
                      spatial_positive_negative a, 
                      spatial_positive_negative b 
                    where 
                      a.species = b.species 
                      and ST_contains(a.geom, b.geom) 
                      and a.ctid != b.ctid 
                      and a.activity_incoming_data_id = b.activity_incoming_data_id 
                    group by 
                      a.activity_incoming_data_id
                  ) 
                group by 
                  a.activity_incoming_data_id, 
                  a.species, 
                  a.regional_districts,
                  a.regional_invasive_species_organization_areas,
                  a.jurisdiction_code, 
                  a.percent_covered, 
                  a.geom, 
                  b.geom, 
                  a.created_timestamp, 
                  a.activity_type
              ), 
              spatial_others as (
                -- select all polygons that don't meet the criteria of the last two CTEs and union with those CTEs
                SELECT 
                  activity_incoming_data_id, 
                  species, 
                  regional_districts,
                  regional_invasive_species_organization_areas,
                  jurisdiction_code, 
                  percent_covered, 
                  geom, 
                  created_timestamp, 
                  activity_type 
                FROM 
                  spatial_positive_negative 
                where 
                  activity_incoming_data_id not in (
                    SELECT 
                      a.activity_incoming_data_id 
                    FROM 
                      spatial_positive_negative a, 
                      spatial_positive_negative b 
                    where 
                      a.species = b.species 
                      and ST_intersects(a.geom, b.geom) 
                      and a.ctid != b.ctid 
                      and a.activity_incoming_data_id = b.activity_incoming_data_id 
                    group by 
                      a.activity_incoming_data_id
                  ) 
                union 
                select 
                  activity_incoming_data_id, 
                  species, 
                  regional_districts,
                  regional_invasive_species_organization_areas,
                  jurisdiction_code, 
                  percent_covered, 
                  geom, 
                  created_timestamp, 
                  activity_type 
                from 
                  spatial_full_overlap 
                union 
                select 
                  * 
                from 
                  spatial_partial_overlap
              ), 
              spatial_union as (
                -- union positive polygons by id/species to not double count area of overlap
                select 
                  species, 
                  invasive_plant_codes.code_description as terrestrial_invasive_plant, 
                  invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant,
                  regional_districts,
                  regional_invasive_species_organization_areas,
                  jurisdiction_code, 
                  jurisdiction_codes.code_description as jurisdiction, 
                  percent_covered, 
                  activity_type, 
                  max(created_timestamp) "max_created_timestamp", 
                  array_agg(activity_incoming_data_id) "activity_ids", 
                  -- Collect original IDs 
                  st_Union(
                    -- Remove embedded linework
                    st_collectionExtract(
                      -- Convert from GeometryCollection to MultiPolygons
                      st_transform(geom, 3005) -- Convert to Albers to get meters
                      , 
                      3
                    )
                  ) "geom" 
                from 
                  spatial_others 
                  left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                  and invasive_plant_code_header.valid_to is null 
                  left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                  and species = invasive_plant_codes.code_name 
                  left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
                  and invasive_plant_aquatic_code_header.valid_to is null 
                  left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
                  and species = invasive_plant_aquatic_codes.code_name 
                  left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                  and jurisdiction_code_header.valid_to is null 
                  left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                  and jurisdiction_code = jurisdiction_codes.code_name 
                group by 
                  species, 
                  invasive_plant_codes.code_description, 
                  invasive_plant_aquatic_codes.code_description, 
                  regional_districts,
                  regional_invasive_species_organization_areas,
                  jurisdiction_code, 
                  jurisdiction_codes.code_description, 
                  percent_covered, 
                  activity_type
              ), 
              spatial_coalesce as (
                select 
                  species, 
                  regional_districts,
                  regional_invasive_species_organization_areas,
                  jurisdiction, 
                  percent_covered :: float8, 
                  coalesce(
                    terrestrial_invasive_plant, aquatic_invasive_plant
                  ) as invasive_plant, 
                  max_created_timestamp, 
                  st_area(geom):: float8 as area_sqm, 
                  geom 
                from 
                  spatial_union 
                where 
                  st_area(geom) > 0 -- don't select empty polygons
                  ) 
            select 
              invasive_plant, 
              regional_districts,
              regional_invasive_species_organization_areas,
              jurisdiction, 
              (percent_covered / 100) * area_sqm as area_sqm, 
              geom 
            from 
              spatial_coalesce
          );
     
         
         
    drop view if exists regional_districts_species_area;
    drop view if exists riso_species_area;
         
    
    
    create or replace view regional_districts_species_area as (
    
    with jurisdiction_species_dump as (
    
    select j.invasive_plant, j.regional_districts, j.jurisdiction, (st_dump(j.geom)).geom::geometry(Polygon,3005) "geom"
    from jurisdiction_species j
    
    )
    
     SELECT i.invasive_plant,
        i.regional_districts,
        i.jurisdiction,
        st_area(st_multi(st_union(i.geom))) AS area_sqm
       FROM jurisdiction_species_dump i
      GROUP BY i.invasive_plant, i.regional_districts, i.jurisdiction
           
      );
    
    create or replace view riso_species_area as (
    
    with jurisdiction_species_dump as (
    
    select j.invasive_plant, j.regional_invasive_species_organization_areas, j.jurisdiction, (st_dump(j.geom)).geom::geometry(Polygon,3005) "geom"
    from jurisdiction_species j
    
    )
    
     SELECT i.invasive_plant,
        i.regional_invasive_species_organization_areas,
        i.jurisdiction,
        st_area(st_multi(st_union(i.geom))) AS area_sqm
       FROM jurisdiction_species_dump i
      GROUP BY i.invasive_plant, i.regional_invasive_species_organization_areas, i.jurisdiction
           
      );
      
    create or replace view jurisdiction_species_area as (
    
    with jurisdiction_species_dump as (
    
    select j.invasive_plant, j.jurisdiction, (st_dump(j.geom)).geom::geometry(Polygon,3005) "geom"
    from jurisdiction_species j
    
    )
    
     SELECT i.invasive_plant,
        i.jurisdiction,
        st_area(st_multi(st_union(i.geom))) AS area_sqm
       FROM jurisdiction_species_dump i
      GROUP BY i.invasive_plant, i.jurisdiction
           
      );
      
     create 
    or replace view current_observation_terrestrial_summary as (
      with select_summary as (
        select 
          o.*, 
          invasive_plant_codes.code_name as species_code, 
          concat(
            o.activity_incoming_data_id, '-', 
            invasive_plant_codes.code_name
          ) as id_species 
        from 
          observation_terrestrial_plant_summary o 
          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
          and invasive_plant_code_header.valid_to is null 
          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
          and o.invasive_plant = invasive_plant_codes.code_description
      ), 
      chemical_treatment as (
        select 
          short_id, 
          invasive_plant, 
          invasive_plant_codes.code_name as species_code, 
          to_timestamp(
            activity_date_time, 'YYYY-MM-DD HH24:MI:SS'
          ) as activity_date_time, 
          chemical_application_method, 
          string_agg(
            distinct herbicide, 
            ', ' 
            order by 
              herbicide
          ) herbicide, 
          st_transform(st_makevalid(geog :: geometry), 4326) as geom 
        from 
          treatment_chemical_terrestrial_plant_summary 
          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
          and invasive_plant_code_header.valid_to is null 
          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
          and invasive_plant = invasive_plant_codes.code_description 
        group by 
          short_id, 
          invasive_plant, 
          invasive_plant_codes.code_name, 
          activity_date_time, 
          geog, 
          chemical_application_method
      ), 
      mechanical_treatment as (
        select 
          short_id, 
          invasive_plant, 
          invasive_plant_codes.code_name as species_code, 
          created_timestamp, 
          treated_area_sqm, 
          mechanical_method, 
          disposal_method, 
          st_transform(st_makevalid(geog :: geometry), 4326) as geom 
        from 
          treatment_mechanical_terrestrial_plant_summary 
          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
          and invasive_plant_code_header.valid_to is null 
          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
          and invasive_plant = invasive_plant_codes.code_description
      ) 
      select 
        s.activity_incoming_data_id, 
        s.activity_id, 
        s.short_id, 
        s.project_code, 
        s.activity_date_time, 
        round(
          st_area(
            st_transform(p.geom, 3005)
          ):: numeric, 
          2
        ) as reported_area_sqm, 
        s.latitude, 
        s.longitude, 
        s.utm_zone, 
        s.utm_easting, 
        s.utm_northing, 
        s.employer, 
        s.funding_agency, 
        s.jurisdiction, 
        s.access_description, 
        s.location_description, 
        s.comment, 
        s.pre_treatment_observation, 
        s.observation_person, 
        s.soil_texture, 
        s.specific_use, 
        s.slope, 
        s.aspect, 
        s.research_observation, 
        s.visible_well_nearby, 
        s.suitable_for_biocontrol_agent, 
        s.invasive_plant, 
        s.density, 
        s.distribution, 
        s.life_stage, 
        c.short_id as chemical_short_id, 
        to_char(
          c.activity_date_time, 'YYYY-MM-DD HH24:MI:SS'
        ) as chemical_treatment_date, 
        c.chemical_application_method, 
        c.herbicide, 
        round(
          st_area(
            st_transform(c.geom, 3005)
          ):: numeric, 
          2
        ) as chemical_treatment_area_sqm, 
        round(
          st_area(
            st_intersection(
              st_transform(p.geom, 3005), 
              st_transform(c.geom, 3005)
            )
          ):: numeric, 
          2
        ) as observation_area_treated, 
        round(
          (
            st_area(
              st_intersection(
                st_transform(p.geom, 3005), 
                st_transform(c.geom, 3005)
              )
            ) / st_area(
              st_transform(p.geom, 3005)
            ) * 100
          ):: numeric, 
          2
        ) as percent_area_treated, 
        m.short_id as mechanical_short_id, 
        to_char(
          m.created_timestamp, 'YYYY-MM-DD HH24:MI:SS'
        ) as mechanical_treatment_date, 
        m.mechanical_method, 
        m.disposal_method, 
        round(
          st_area(
            st_transform(m.geom, 3005)
          ):: numeric, 
          2
        ) as mechanical_treatment_area_sqm, 
        s.voucher_sample_id, 
        s.date_voucher_collected, 
        s.date_voucher_verified, 
        s.name_of_herbarium, 
        s.accession_number, 
        s.voucher_person_name, 
        s.voucher_organization, 
        s.voucher_utm_zone, 
        s.voucher_utm_easting, 
        s.voucher_utm_northing, 
        s.elevation, 
        s.well_proximity, 
        s.biogeoclimatic_zones, 
        s.regional_invasive_species_organization_areas, 
        s.invasive_plant_management_areas, 
        s.ownership, 
        s.regional_districts, 
        s.flnro_districts, 
        s.moti_districts, 
        s.photo, 
        s.created_timestamp, 
        s.received_timestamp, 
        p.geom 
      from 
        select_summary s 
        join current_positive_observations p on p.id_species = s.id_species 
        left outer join chemical_treatment c on st_intersects2(p.geom, c.geom) 
        and p.species_code = c.species_code 
        and p.created_timestamp < c.activity_date_time 
        left outer join mechanical_treatment m on st_intersects2(p.geom, m.geom) 
        and p.species_code = m.species_code 
        and p.created_timestamp < m.created_timestamp
    );
    
    create or replace view current_observation_aquatic_summary as (
              with select_summary as (
              select o.*,
                     invasive_plant_codes.code_name as species_code,
                     concat(o.activity_incoming_data_id, '-', invasive_plant_codes.code_name) as id_species
    
              from observation_aquatic_plant_summary o
    
                    left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_aquatic_code'
                    and invasive_plant_code_header.valid_to is null
                    left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id
                    and o.invasive_plant = invasive_plant_codes.code_description
              ),
              chemical_treatment as (
    
              select short_id,
                     invasive_plant,
                     invasive_plant_codes.code_name as species_code,
                     to_timestamp(activity_date_time, 'YYYY-MM-DD HH24:MI:SS') as activity_date_time,
                     chemical_application_method,
                     string_agg(distinct herbicide, ', ' order by herbicide) herbicide,
                     st_transform(st_makevalid(geog::geometry), 4326) as geom
    
              from treatment_chemical_aquatic_plant_summary
    
                    left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_aquatic_code'
                    and invasive_plant_code_header.valid_to is null
                    left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id
                    and invasive_plant = invasive_plant_codes.code_description
    
              group by short_id,
                       invasive_plant,
                       invasive_plant_codes.code_name,
                       activity_date_time,
                       geog,
                       chemical_application_method
    
              ),
              mechanical_treatment as (
    
              select short_id,
                     invasive_plant,
                     invasive_plant_codes.code_name as species_code,
                     created_timestamp,
                     treated_area_sqm,
                     mechanical_method,
                     disposal_method,
                     st_transform(st_makevalid(geog::geometry), 4326) as geom
    
                     from treatment_mechanical_aquatic_plant_summary
    
                    left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_aquatic_code'
                    and invasive_plant_code_header.valid_to is null
                    left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id
                    and invasive_plant = invasive_plant_codes.code_description
    
              )
    
              select s.activity_incoming_data_id,
                     s.activity_id,
                     s.short_id,
                     s.project_code,
                     s.activity_date_time,
                     round(st_area(st_transform(p.geom, 3005))::numeric, 2) as reported_area_sqm,
                     s.latitude,
                     s.longitude,
                     s.utm_zone,
                     s.utm_easting,
                     s.utm_northing,
                     s.employer,
                     s.funding_agency,
                     s.jurisdiction,
                     s.access_description,
                     s.location_description,
                     s.comment,
                     s.pre_treatment_observation,
                     s.observation_person,
                     s.shorelines,
                     s.waterbody_type,
                     s.waterbody_name_gazetted,
                     s.waterbody_name_local,
                     s.waterbody_access,
                     s.waterbody_use,
                     s.water_level_management,
                     s.substrate_type,
                     s.tidal_influence,
                     s.adjacent_land_use,
                     s.inflow_permanent,
                     s.inflow_other,
                     s.outflow,
                     s.outflow_other,
                     s.waterbody_comment,
                     s.water_sample_depth_meters,
                     s.secchi_depth_meters,
                     s.water_colour,
                     s.suitable_for_biocontrol_agent,
                     s.sample_point_id,
                     s.observation_type,
                     s.invasive_plant,
                     s.invasive_plant_density,
                     s.invasive_plant_distribution,
                     s.plant_life_stage,
                     c.short_id as chemical_short_id,
                     to_char(c.activity_date_time, 'YYYY-MM-DD HH24:MI:SS') as chemical_treatment_date,
                     c.chemical_application_method,
                     c.herbicide,
                     round(st_area(st_transform(c.geom, 3005))::numeric, 2) as chemical_treatment_area_sqm,
                     m.short_id as mechanical_short_id,
                     to_char(m.created_timestamp, 'YYYY-MM-DD HH24:MI:SS') as mechanical_treatment_date,
                     m.mechanical_method,
                     m.disposal_method,
                     round(st_area(st_transform(m.geom, 3005))::numeric, 2) as mechanical_treatment_area_sqm,
                     s.voucher_sample_id,
                     s.date_voucher_collected,
                     s.date_voucher_verified,
                     s.name_of_herbarium,
                     s.accession_number,
                     s.voucher_person_name,
                     s.voucher_organization,
                     s.voucher_utm_zone,
                     s.voucher_utm_easting,
                     s.voucher_utm_northing,
                     s.elevation,
                     s.well_proximity,
                     s.biogeoclimatic_zones,
                     s.regional_invasive_species_organization_areas,
                     s.invasive_plant_management_areas,
                     s.ownership,
                     s.regional_districts,
                     s.flnro_districts,
                     s.moti_districts,
                     s.photo,
                     s.created_timestamp,
                     s.received_timestamp,
                     p.geom
    
              from select_summary s
    
              join current_positive_observations p on p.id_species = s.id_species
              left outer join chemical_treatment c on st_intersects2(p.geom, c.geom) and p.species_code = c.species_code and p.created_timestamp < c.activity_date_time
              left outer join mechanical_treatment m on st_intersects2(p.geom, m.geom) and p.species_code = m.species_code and p.created_timestamp < m.created_timestamp
    
              );
    
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';


  `);
}
