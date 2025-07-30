import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
-- drop activity_record_with_permissions type and function, create new function
      
drop function if exists invasivesbc.fetch_activity_with_user_permissions(int4,
_uuid);

drop type if exists invasivesbc.activity_record_with_permissions;

create or replace
function invasivesbc.fetch_activity_with_user_permissions(
  target_user_id integer,
  activity_ids uuid[]
)
returns table (
  	    activity_incoming_data_id integer,
	    activity_id uuid,
	    "version" int4,
	    activity_type varchar(200),
	    activity_subtype varchar(200),
	    created_timestamp timestamp,
	    received_timestamp timestamp,
	    deleted_timestamp timestamp,
	    geom public.geometry(geometry,
3005),
	    geog public.geography(geometry,
4326),
	    media_keys _text,
	    activity_payload jsonb,
	    biogeoclimatic_zones varchar(30),
	    regional_invasive_species_organization_areas varchar(100),
	    invasive_plant_management_areas varchar(100),
	    ownership varchar(100),
	    regional_districts varchar(100),
	    flnro_districts varchar(100),
	    moti_districts varchar(100),
	    elevation int4,
	    well_proximity int4,
	    utm_zone int4,
	    utm_northing float4,
	    utm_easting float4,
	    albers_northing float4,
	    albers_easting float4,
	    created_by varchar(100),
	    form_status varchar(100),
	    sync_status varchar(100),
	    review_status varchar(100),
	    reviewed_by varchar(100),
	    reviewed_at timestamp,
	    species_positive jsonb,
	    species_negative jsonb,
	    jurisdiction _varchar,
	    updated_by varchar(100),
	    species_treated jsonb,
	    species_positive_full text,
	    species_negative_full text,
	    species_treated_full text,
	    agency text,
	    jurisdiction_display text,
	    short_id text,
	    created_by_with_guid text,
	    updated_by_with_guid text,
	    activity_subtype_full text,
	    batch_id int4,
	    row_number int4,
	    species_biocontrol_full text,
	    iscurrent bool,
	    map_symbol text,
	    invasive_plant text,
	    centroid public.geometry,
	    can_edit boolean,
	    can_delete boolean
)
as $$
begin
  return QUERY
  with user_details as (
select
	idir_account_name,
	bceid_account_name,
	funding_agencies,
	employer
from
	invasivesbc.application_user
where
	user_id = target_user_id
  )
  select
	aid.activity_incoming_data_id,
	aid.activity_id,
	aid.version,
	aid.activity_type,
	aid.activity_subtype,
	aid.created_timestamp,
	aid.received_timestamp,
	aid.deleted_timestamp,
	aid.geom,
	aid.geog,
	aid.media_keys,
	aid.activity_payload,
	aid.biogeoclimatic_zones,
	aid.regional_invasive_species_organization_areas,
	aid.invasive_plant_management_areas,
	aid.ownership,
	aid.regional_districts,
	aid.flnro_districts,
	aid.moti_districts,
	aid.elevation,
	aid.well_proximity,
	aid.utm_zone,
	aid.utm_northing,
	aid.utm_easting,
	aid.albers_northing,
	aid.albers_easting,
	aid.created_by,
	aid.form_status,
	aid.sync_status,
	aid.review_status,
	aid.reviewed_by,
	aid.reviewed_at,
	aid.species_positive,
	aid.species_negative,
	aid.jurisdiction,
	aid.updated_by,
	aid.species_treated,
	aid.species_positive_full,
	aid.species_negative_full,
	aid.species_treated_full,
	aid.agency,
	aid.jurisdiction_display,
	aid.short_id,
	aid.created_by_with_guid,
	aid.updated_by_with_guid,
	aid.activity_subtype_full,
	aid.batch_id,
	aid.row_number,
	aid.species_biocontrol_full,
	aid.iscurrent,
	aid.map_symbol,
	aid.invasive_plant,
	aid.centroid,
	(
      aid.created_by = ud.idir_account_name
		or aid.created_by = ud.bceid_account_name
		or perms.can_edit
		or (perms.can_edit_employer
			and aid.activity_payload #>> '{form_data, activity_data, employer_code}' = any(string_to_array(ud.employer, ',')))
			or (perms.can_edit_agency
				and aid.activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}' = any(string_to_array(ud.funding_agencies, ',')))
    ) as can_edit,
	(
      aid.created_by = ud.idir_account_name
		or aid.created_by = ud.bceid_account_name
		or perms.can_delete
		or (perms.can_delete_employer
			and aid.activity_payload #>> '{form_data, activity_data, employer_code}' = any(string_to_array(ud.employer, ',')))
			or (perms.can_delete_agency
				and aid.activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}' = any(string_to_array(ud.funding_agencies, ',')))
    ) as can_delete
from
	invasivesbc.activity_incoming_data aid
join lateral invasivesbc.get_user_permissions_for_activity_subtype(
    target_user_id,
	aid.activity_subtype
  ) as perms on
	true
join user_details ud on
	true
where
	aid.activity_id = any(activity_ids)
	and aid.iscurrent = true
	and perms.can_read = true;
end;

$$ language plpgsql;


-- change batch trigger to before insert only
drop trigger if exists maintain_batch_and_row_id on
invasivesbc.activity_incoming_data;

create trigger maintain_batch_and_row_id before
insert
    on
    invasivesbc.activity_incoming_data for each row execute function invasivesbc.batch_and_row_id_autofill();



-- fix invasive_plant column issue
-- drop invasive_plant trigger
drop trigger if exists invasive_plant on
invasivesbc.activity_incoming_data;

-- drop invasive_plant column
alter table invasivesbc.activity_incoming_data
drop column invasive_plant;

-- create new column
alter table invasivesbc.activity_incoming_data
add column invasive_plant TEXT;

-- add index
create index activity_incoming_data_invasive_plant_idx on
invasivesbc.activity_incoming_data
	using btree (invasive_plant);

-- add function
create or replace
function invasivesbc.update_invasive_plant()
 returns trigger
 language plpgsql
as $function$
      begin
        set
          search_path = invasivesbc,
            public;

with invasive_plants as (
select
	a.activity_incoming_data_id,
	string_agg(distinct c.code_description, ', ' order by c.code_description) as invasive_plant
from
	invasivesbc.activity_incoming_data a
left join lateral (
	select
		unnest(array_cat(
            array_cat(
                case 
                    when jsonb_typeof(species_positive) = 'array' then 
                        array(select jsonb_array_elements_text(species_positive)) 
                    else '{}' 
                end,
                case 
                    when jsonb_typeof(species_negative) = 'array' then 
                        array(select jsonb_array_elements_text(species_negative)) 
                    else '{}' 
                end
            ),
            case 
                when jsonb_typeof(species_treated) = 'array' then 
                    array(select jsonb_array_elements_text(species_treated)) 
                else '{}' 
            end
        )) as species_code
) species_agg on
	true
left join invasivesbc.code c 
    on
	c.code_name = species_agg.species_code
		and c.code_header_id in (39, 40)
	where
		a.iscurrent
		and a.activity_incoming_data_id = new.activity_incoming_data_id
	group by
		a.activity_incoming_data_id)
        update
	invasivesbc.activity_incoming_data aid
set
	invasive_plant = ip.invasive_plant
from
	invasive_plants ip
where
	aid.activity_incoming_data_id = ip.activity_incoming_data_id
	and aid.activity_incoming_data_id = new.activity_incoming_data_id;

return new;
end
      $function$
;

-- add trigger
create trigger invasive_plant after
insert
	on
	invasivesbc.activity_incoming_data for each row execute function invasivesbc.update_invasive_plant();

-- update column
with invasive_plants as (
select
	a.activity_incoming_data_id,
	string_agg(distinct c.code_description, ', ' order by c.code_description) as invasive_plant
from
	invasivesbc.activity_incoming_data a
left join lateral (
	select
		unnest(array_cat(
            array_cat(
                case 
                    when jsonb_typeof(species_positive) = 'array' then 
                        array(select jsonb_array_elements_text(species_positive)) 
                    else '{}' 
                end,
                case 
                    when jsonb_typeof(species_negative) = 'array' then 
                        array(select jsonb_array_elements_text(species_negative)) 
                    else '{}' 
                end
            ),
            case 
                when jsonb_typeof(species_treated) = 'array' then 
                    array(select jsonb_array_elements_text(species_treated)) 
                else '{}' 
            end
        )) as species_code
) species_agg on
	true
left join invasivesbc.code c 
    on
	c.code_name = species_agg.species_code
		and c.code_header_id in (39, 40)
	group by
		a.activity_incoming_data_id)
        update
	invasivesbc.activity_incoming_data aid
set
	invasive_plant = ip.invasive_plant
from
	invasive_plants ip
where
	aid.activity_incoming_data_id = ip.activity_incoming_data_id;

-- new map_symbol function
create or replace
function invasivesbc.update_map_symbol()
 returns trigger
 language plpgsql
as $function$
      begin
        set
          search_path = invasivesbc,
            public;

with map_symbols as (
select
	a.activity_incoming_data_id,
	string_agg(
       distinct species_agg.species, ', ' order by species_agg.species
    ) as species
from
	invasivesbc.activity_incoming_data a
left join lateral (
	select
		unnest(array_cat(
            array_cat(
                case 
                    when jsonb_typeof(species_positive) = 'array' then 
                        array(select jsonb_array_elements_text(species_positive)) 
                    else '{}' 
                end,
                case 
                    when jsonb_typeof(species_negative) = 'array' then 
                        array(select jsonb_array_elements_text(species_negative)) 
                    else '{}' 
                end
            ),
            case 
                when jsonb_typeof(species_treated) = 'array' then 
                    array(select jsonb_array_elements_text(species_treated)) 
                else '{}' 
            end
        )) as species
) species_agg on
	true
where
	a.iscurrent
	and a.activity_incoming_data_id = new.activity_incoming_data_id
group by
	a.activity_incoming_data_id)
        update
	invasivesbc.activity_incoming_data aid
set
	map_symbol = ms.species
from
	map_symbols ms
where
	aid.activity_incoming_data_id = ms.activity_incoming_data_id
	and aid.activity_incoming_data_id = new.activity_incoming_data_id;

return new;
end
      $function$
;
    `
  );
}

export async function down(knex: Knex) {
  //language=PostgreSQL
  await knex.raw(
    `
    set search_path = invasivesbc, public;

    `
  );
}
