import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path = invasivesbc,public;

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
        geometry(geog) "geom" -- Convert to Geometry (EPSG:4326)
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
        geometry(geog) "geom" 
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
        geometry(geog) "geom" -- Convert to Geometry (EPSG:4326)
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
        geometry(geog) "geom"
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
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    drop view if exists invasivesbc.current_positive_observations;
    drop view if exists invasivesbc.current_negative_observations;

    `);
}
