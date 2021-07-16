import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;

set search_path='invasivesbc';
-- While we could wait a long time for the materialized view to update - this is also practice for what we'll be dealing with later with activities.

--create a version of to_date that is usable in index.  if a backup is restored to a server with different local there will be issues, but that's unlikely.
create or replace function immutable_to_date(the_date text)
   returns date
   language sql
   immutable
as
$body$
  select to_date(the_date, 'yyyy-mm-dd');
$body$
;

--too big but would simply things:
--CREATE INDEX point_of_interest_payload_idx ON invasivesbc.point_of_interest_incoming_data USING btree (point_of_interest_payload);

--id index
drop index if exists point_of_interest_id_idx;
CREATE INDEX point_of_interest_id_idx ON invasivesbc.point_of_interest_incoming_data USING btree (point_of_interest_id);

--nested array field indexes
drop index if exists point_of_interest_survey_date_idx;
CREATE INDEX point_of_interest_survey_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (immutable_to_date((point_of_interest_payload -> 'form_data' -> 'surveys' -> 'survey_date'::text)::text)) ;

drop index if exists point_of_interest_chemical_treatment_date_idx;
CREATE INDEX point_of_interest_chemical_treatment_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (immutable_to_date((point_of_interest_payload -> 'form_data' -> 'chemical_treatments' -> 'treatment_date'::text)::text)) ;

drop index if exists point_of_interest_chemical_monitoring_date_idx;
CREATE INDEX point_of_interest_chemical_monitoring_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (immutable_to_date((point_of_interest_payload -> 'form_data' -> 'chemical_treatments' -> 'monitoring' -> 'monitoring_date'::text)::text)) ;

drop index if exists point_of_interest_biological_dispersal_date_idx;
CREATE INDEX point_of_interest_biological_dispersal_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (immutable_to_date((point_of_interest_payload -> 'form_data' -> 'biological_dispersals' -> 'monitoring_date'::text)::text)) ;

drop index if exists point_of_interest_biological_treatment_date_idx;
CREATE INDEX point_of_interest_biological_treatment_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (immutable_to_date((point_of_interest_payload -> 'form_data' -> 'biological_treatments' -> 'treatment_date'::text)::text)) ;

drop index if exists point_of_interest_biological_treatment_monitoring_date_idx;
CREATE INDEX point_of_interest_biological_treatment_monitoring_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (immutable_to_date((point_of_interest_payload -> 'form_data' -> 'biological_treatments' -> 'monitoring' -> 'monitoring_date'::text)::text)) ;

drop index if exists point_of_interest_mechanical_treatment_date_idx;
CREATE INDEX point_of_interest_mechanical_treatment_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (immutable_to_date((point_of_interest_payload -> 'form_data' -> 'mechanical_treatments' -> 'treatment_date'::text)::text)) ;

drop index if exists point_of_interest_mechanical_treatment_monitoring_date_idx;
CREATE INDEX point_of_interest_mechanical_treatment_monitoring_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (immutable_to_date((point_of_interest_payload -> 'form_data' -> 'mechanical_treatments' -> 'monitoring' -> 'monitoring_date'::text)::text)) ;



--main view to parse json and sort dates

drop view if exists IAPP_SITE_SUMMARY_slow cascade;
create or replace view IAPP_SITE_SUMMARY_slow as (
with
summary_fields as (
	SELECT
	point_of_interest_incoming_data.point_of_interest_id as id
	/*btrim((((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'point_of_interest_type_data'::text) -> 'site_id'::text)::text, '"'::text) AS site_id,
    btrim((((((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'point_of_interest_data'::text) -> 'project_code'::text) -> 0) -> 'description'::text)::text, '"'::text) AS project_code,
    btrim((((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'point_of_interest_data'::text) -> 'general_comment'::text)::text, '"'::text) AS general_comment
    btrim((((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'point_of_interest_type_data'::text) -> 'site_id'::text)::text, '"'::text) AS jurisdiction,
    btrim((((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'point_of_interest_type_data'::text) -> 'slope'::text)::text, '"'::text) AS slope,
    btrim((((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'point_of_interest_type_data'::text) -> 'aspect'::text)::text, '"'::text) AS aspect*/
   	FROM point_of_interest_incoming_data
),
survey_dates as (
	SELECT
		point_of_interest_incoming_data.point_of_interest_id AS id,
		immutable_to_date(btrim((json_array_elements((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'surveys'::text) -> 'survey_date'::text)::text, '"'::text)::text) as survey_dates
		FROM point_of_interest_incoming_data
),
chemical_treatment_dates as (
	SELECT
		point_of_interest_incoming_data.point_of_interest_id As id,
		immutable_to_date(btrim((json_array_elements((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'chemical_treatments'::text) -> 'treatment_date'::text)::text, '"'::text)::text) as chemical_treatment_dates
		FROM point_of_interest_incoming_data
),
chemical_treatment_monitoring_dates as (
	SELECT
		point_of_interest_incoming_data.point_of_interest_id AS id,
		immutable_to_date(btrim((json_array_elements(json_array_elements((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'chemical_treatments'::text) -> 'monitoring'::text) -> 'monitoring_date'::text)::text, '"'::text)::text) as chemical_treatment_monitoring_dates
		FROM point_of_interest_incoming_data
),
biological_dispersal_dates as (
	SELECT
		point_of_interest_incoming_data.point_of_interest_id AS id,
		immutable_to_date(btrim((json_array_elements((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'biological_dispersals'::text) -> 'monitoring_date'::text)::text, '"'::text)::text) as bio_dispersal_dates
		FROM point_of_interest_incoming_data
),
biological_treatment_dates as (
	SELECT
		point_of_interest_incoming_data.point_of_interest_id AS id,
		immutable_to_date(btrim((json_array_elements((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'biological_treatments'::text) -> 'treatment_date'::text)::text, '"'::text)::text) as bio_treatment_dates
		FROM point_of_interest_incoming_data
),
biological_treatment_monitoring_dates as (
	SELECT
		point_of_interest_incoming_data.point_of_interest_id AS id,
		immutable_to_date(btrim((json_array_elements(json_array_elements((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'biological_treatments'::text) -> 'monitoring'::text) -> 'monitoring_date'::text)::text, '"'::text)::text) as bio_treatment_monitoring_dates
		FROM point_of_interest_incoming_data
),
mechanical_treatment_dates as (
	SELECT
		point_of_interest_incoming_data.point_of_interest_id AS id,
		immutable_to_date(btrim((json_array_elements((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'mechanical_treatments'::text) -> 'treatment_date'::text)::text, '"'::text)::text) as mechanical_treatment_dates
		FROM point_of_interest_incoming_data
),
mechanical_treatment_monitoring_dates as (
	SELECT
		point_of_interest_incoming_data.point_of_interest_id AS id,
		immutable_to_date(btrim((json_array_elements(json_array_elements((point_of_interest_incoming_data.point_of_interest_payload::json -> 'form_data'::text) -> 'mechanical_treatments'::text) -> 'monitoring'::text) -> 'monitoring_date'::text)::text, '"'::text)::text) as mechanical_treatment_monitoring_dates
		FROM point_of_interest_incoming_data
)
SELECT
	sf.id,
	min(sd.survey_dates) as min_survey,
	max(sd.survey_dates) as max_survey,
    min(ct.chemical_treatment_dates) as min_chemical_treatment_dates,
	max(ct.chemical_treatment_dates) as max_chemical_treatment_dates,
	min(ctm.chemical_treatment_monitoring_dates) as min_chemical_treatment_monitoring_dates,
	max(ctm.chemical_treatment_monitoring_dates) as max_chemical_treatment_monitoring_dates,
	max(bd.bio_dispersal_dates) as max_bio_dispersal_dates,
	min(bd.bio_dispersal_dates) as min_bio_dispersal_dates,
	max(bt.bio_treatment_dates) as max_bio_treatment_dates,
	max(bt.bio_treatment_dates) as min_bio_treatment_dates,
	max(btm.bio_treatment_monitoring_dates) as max_bio_treatment_monitoring_dates,
	min(btm.bio_treatment_monitoring_dates) as min_bio_treatment_monitoring_dates,
	min(mt.mechanical_treatment_dates) as min_mechanical_treatment_dates,
	max(mt.mechanical_treatment_dates) as max_mechanical_treatment_dates,
	min(mtm.mechanical_treatment_monitoring_dates) as min_mechanical_treatment_monitoring_dates,
	max(mtm.mechanical_treatment_monitoring_dates) as max_mechanical_treatment_monitoring_dates
   FROM summary_fields sf
   left join survey_dates sd on sd.id = sf.id
  left join chemical_treatment_dates ct on ct.id = sf.id
   left join chemical_treatment_monitoring_dates ctm on ctm.id = sf.id
  left join biological_dispersal_dates bd on bd.id = sf.id
  left join biological_treatment_dates bt on bt.id = sf.id
 left join biological_treatment_monitoring_dates btm on btm.id = sf.id
 left join mechanical_treatment_dates mt on mt.id = sf.id
  left join mechanical_treatment_monitoring_dates mtm on mtm.id = sf.id
   group by sf.id
);


--for testing
--select * from IAPP_SITE_SUMMARY limit 100

drop materialized view if exists iapp_site_summary;
create materialized view iapp_site_summary as select * from iapp_site_summary_slow;


  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
drop index if exists point_of_interest_survey_date_idx;
drop index if exists point_of_interest_chemical_treatment_date_idx;
drop index if exists point_of_interest_chemical_monitoring_date_idx;
drop index if exists point_of_interest_biological_dispersal_date_idx;
drop index if exists point_of_interest_biological_treatment_date_idx;
drop index if exists point_of_interest_biological_treatment_monitoring_date_idx;
drop index if exists point_of_interest_mechanical_treatment_date_idx;
drop index if exists point_of_interest_mechanical_treatment_monitoring_date_idx;
drop view if exists IAPP_SITE_SUMMARY_slow cascade;
drop materialized view if exists iapp_site_summary;
}`);
}
