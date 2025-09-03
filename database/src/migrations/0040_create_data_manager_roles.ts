import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
-- create data manager roles

INSERT INTO invasivesbc.user_role
(role_id, role_description, role_name, created_at, updated_at, metabase_group)
VALUES(19, 'Data Manager - Animals', 'data_manager_animals', now(), now(), 'standard_user');

INSERT INTO invasivesbc.user_role
(role_id, role_description, role_name, created_at, updated_at, metabase_group)
VALUES(20, 'Data Manager - Plants', 'data_manager_plants', now(), now(), 'standard_user');

INSERT INTO invasivesbc.user_role
(role_id, role_description, role_name, created_at, updated_at, metabase_group)
VALUES(21, 'Data Manager - Both', 'data_manager_both', now(), now(), 'standard_user');


-- create primary_employer and primary_agency columns

alter table invasivesbc.application_user 
add column primary_employer text;

alter table invasivesbc.application_user 
add column primary_agency text;


-- update fetch_activity_with_user_permissions function

create or replace
function invasivesbc.fetch_activity_with_user_permissions(target_user_id integer,
activity_ids uuid[])
 returns table(activity_incoming_data_id integer, activity_id uuid, version integer, activity_type character varying, activity_subtype character varying, created_timestamp timestamp without time zone, received_timestamp timestamp without time zone, deleted_timestamp timestamp without time zone, geom geometry, geog geography, media_keys text[], activity_payload jsonb, biogeoclimatic_zones character varying, regional_invasive_species_organization_areas character varying, invasive_plant_management_areas character varying, ownership character varying, regional_districts character varying, flnro_districts character varying, moti_districts character varying, elevation integer, well_proximity integer, utm_zone integer, utm_northing real, utm_easting real, albers_northing real, albers_easting real, created_by character varying, form_status character varying, sync_status character varying, review_status character varying, reviewed_by character varying, reviewed_at timestamp without time zone, species_positive jsonb, species_negative jsonb, jurisdiction character varying[], updated_by character varying, species_treated jsonb, species_positive_full text, species_negative_full text, species_treated_full text, agency text, jurisdiction_display text, short_id text, created_by_with_guid text, updated_by_with_guid text, activity_subtype_full text, batch_id integer, row_number integer, species_biocontrol_full text, iscurrent boolean, map_symbol text, invasive_plant text, centroid geometry, can_edit boolean, can_delete boolean)
 language plpgsql
as $function$
begin
  return QUERY
  with user_details as (
select
	idir_account_name,
	bceid_account_name,
	primary_employer,
	primary_agency
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
  or (
    perms.can_edit_employer
    and string_to_array(ud.primary_employer, ',') &&
        string_to_array(aid.activity_payload #>> '{form_data, activity_data, employer_code}', ',')
  )
  or (
    perms.can_edit_agency
    and string_to_array(ud.primary_agency, ',') &&
        string_to_array(aid.activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}', ',')
  )
) as can_edit,
(
  aid.created_by = ud.idir_account_name
  or aid.created_by = ud.bceid_account_name
  or perms.can_delete
  or (
    perms.can_delete_employer
    and string_to_array(ud.primary_employer, ',') &&
        string_to_array(aid.activity_payload #>> '{form_data, activity_data, employer_code}', ',')
  )
  or (
    perms.can_delete_agency
    and string_to_array(ud.primary_agency, ',') &&
        string_to_array(aid.activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}', ',')
  )
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

$function$
;


-- update permissions table
-- animals
update invasivesbc.permissions 
set can_write = true,
can_read = true,
can_delete_employer = true,
can_delete_agency = true,
can_edit_employer = true,
can_edit_agency = true,
can_review_and_publish_employer = true,
can_review_and_publish_agency = true
where role_id = 19 
and category_id in ('ANIMAL_OBSERVATION', 'ANIMAL_TREATMENT_MONITORING', 'ANIMAL_TRANSECT');

-- plants
update invasivesbc.permissions 
set can_write = true,
can_read = true,
can_delete_employer = true,
can_delete_agency = true,
can_edit_employer = true,
can_edit_agency = true,
can_review_and_publish_employer = true,
can_review_and_publish_agency = true
where role_id = 20 
and category_id in ('PLANT_OBSERVATION', 'PLANT_TREATMENT_MONITORING', 'PLANT_TRANSECT', 'PLANT_BIOCONTROL');

-- both
update invasivesbc.permissions 
set can_write = true,
can_read = true,
can_delete_employer = true,
can_delete_agency = true,
can_edit_employer = true,
can_edit_agency = true,
can_review_and_publish_employer = true,
can_review_and_publish_agency = true
where role_id = 21 
and category_id in ('ANIMAL_OBSERVATION', 'ANIMAL_TREATMENT_MONITORING', 'ANIMAL_TRANSECT', 'PLANT_OBSERVATION', 'PLANT_TREATMENT_MONITORING', 'PLANT_TRANSECT', 'PLANT_BIOCONTROL');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
delete from invasivesbc.user_role 
where role_id in (19, 20, 21);

alter table invasivesbc.application_user 
drop column primary_agency;

alter table invasivesbc.application_user 
drop column primary_employer;

create or replace
        function invasivesbc.fetch_activity_with_user_permissions(
        target_user_id integer,
        activity_ids uuid[]
      )
        returns table(activity_incoming_data_id integer, activity_id uuid, version integer, activity_type character varying, activity_subtype character varying, created_timestamp timestamp without time zone, received_timestamp timestamp without time zone, deleted_timestamp timestamp without time zone, geom geometry, geog geography, media_keys text[], activity_payload jsonb, biogeoclimatic_zones character varying, regional_invasive_species_organization_areas character varying, invasive_plant_management_areas character varying, ownership character varying, regional_districts character varying, flnro_districts character varying, moti_districts character varying, elevation integer, well_proximity integer, utm_zone integer, utm_northing real, utm_easting real, albers_northing real, albers_easting real, created_by character varying, form_status character varying, sync_status character varying, review_status character varying, reviewed_by character varying, reviewed_at timestamp without time zone, species_positive jsonb, species_negative jsonb, jurisdiction character varying[], updated_by character varying, species_treated jsonb, species_positive_full text, species_negative_full text, species_treated_full text, agency text, jurisdiction_display text, short_id text, created_by_with_guid text, updated_by_with_guid text, activity_subtype_full text, batch_id integer, row_number integer, species_biocontrol_full text, iscurrent boolean, map_symbol text, invasive_plant text, centroid geometry, can_edit boolean, can_delete boolean)
      as
      $$
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
	user_id = target_user_id)
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
			and aid.activity_payload #>> '{form_data, activity_data, employer_code}' = any
                         (string_to_array(ud.employer, ',')))
			or (perms.can_edit_agency
				and aid.activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}' = any
                         (string_to_array(ud.funding_agencies, ',')))
                   ) as can_edit,
	(
                   aid.created_by = ud.idir_account_name
		or aid.created_by = ud.bceid_account_name
		or perms.can_delete
		or (perms.can_delete_employer
			and aid.activity_payload #>> '{form_data, activity_data, employer_code}' = any
                         (string_to_array(ud.employer, ',')))
			or (perms.can_delete_agency
				and aid.activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}' = any
                         (string_to_array(ud.funding_agencies, ',')))
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
	aid.activity_id = any (activity_ids)
	and aid.iscurrent = true
	and perms.can_read = true;
end;

$$ language plpgsql;
  `);
}
