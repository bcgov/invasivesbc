import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path=invasivesbc;
    drop VIEW if exists invasivesbc.FREP_FormC cascade;
  CREATE OR REPLACE VIEW invasivesbc.FREP_FormC as (
    select	
    activity_id as activity_id,

    activity_payload::json->'form_data'->'activity_data'->'latitude' as latitude,
    activity_payload::json->'form_data'->'activity_data'->'longitude' as longitude,
    activity_payload::json->'form_data'->'activity_data'->'reported_area' as reported_area,
    activity_payload::json->'form_data'->'activity_data'->'invasive_species_agency_code' as invasive_species_agency_code,
    activity_payload::json->'form_data'->'activity_data'->'general_comment' as general_comment,
    activity_payload::json->'form_data'->'activity_data'->'access_description' as access_description,
    activity_payload::json->'form_data'->'activity_data'->'jurisdictions' as jurisdictions,
    activity_payload::json->'form_data'->'activity_data'->'project_code' as project_code,
    activity_payload::json->'form_data'->'activity_data'->'general_comment' as general_observation_comment__NEEDS_VERIFY,

    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'opening_number')::text)) as opening_number,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'opening_id')::text)) as opening_id,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'license_number')::text)) as license_number,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'cp_number')::text)) as cp_number,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'block')::text)) as block,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'licensee')::text)) as licensee,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'district_code')::text)) as district_code,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'location_description')::text)) as location_description,
    (activity_payload::json->'form_data'->'acitivity_subtype_data'->'nar')::text::decimal as nar,
    (activity_payload::json->'form_data'->'acitivity_subtype_data'->'gross_area')::text::decimal as gross_area,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'override_code')::text)) as override_code,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'innovative_practices')::text)) as innovative_practices,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'invasive_code')::text)) as invasive_code,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'evaluator_opinion_code')::text)) as evaluator_opinion_code,
    trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'rationale')::text)) as rationale,

    biogeoclimatic_zones,
    regional_invasive_species_organization_areas,
    invasive_plant_management_areas,
    ownership,
    regional_districts,
    flnro_districts,
    moti_districts,
    elevation,
    well_proximity,
    utm_zone,
    utm_northing,
    utm_easting,
    albers_northing,
    albers_easting

    from invasivesbc.activity_incoming_data
    where invasivesbc.activity_incoming_data.activity_type = 'FREP_FormC'
	and deleted_timestamp is null
    );
    COMMENT ON VIEW invasivesbc.FREP_FormC IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';




    drop VIEW if exists invasivesbc.FREP_FormB cascade;
    CREATE OR REPLACE VIEW invasivesbc.FREP_FormB as (
      select
      activity_id as activity_id,
      version,
  
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'date')::text))::timestamp as date,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'opening_id')::text)) as opening_id,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'assessed_by')::text)) as assessed_by,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'stratum_id')::text)) as stratum_id,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'stratum_number')::text::integer as stratum_number,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'stratum_type')::text)) as stratum_type,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'num_plots_stratum')::text::integer as num_plots_stratum,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'mapped_stratum_size')::text)) as mapped_stratum_size,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'bec_zone')::text)) as bec_zone,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'subzone')::text)) as subzone,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'variant')::text::integer as variant,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'site_series')::text)) as site_series,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'stratum_location_consistent')::text)) as stratum_location_consistent,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'estimated_size')::text::decimal as estimated_size,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'estimated_age_of_oldest_trees')::text::integer as estimated_age_of_oldest_trees,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'patch_location')::text)) as patch_location,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'percent_trees_windthrown')::text)) as percent_trees_windthrown,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'windthrow_distribution')::text)) as windthrow_distribution,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'windthrow_treatment')::text)) as windthrow_treatment,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'reserve_constraints_none')::text)) as reserve_constraints_none,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'wetsite')::text)) as wetsite,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'rmz')::text)) as rmz,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'rrz')::text)) as rrz,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'rock_outcrop')::text)) as rock_outcrop,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'noncommercial_brush')::text)) as noncommercial_brush,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'low_mercantile_timber')::text)) as low_mercantile_timber,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'sensitive_terrain')::text)) as sensitive_terrain,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'uwr_wha_whf')::text)) as uwr_wha_whf,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'ogma')::text)) as ogma,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'visuals')::text)) as visuals,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'cultural_heritage_feature')::text)) as cultural_heritage_feature,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'recreation_feature')::text)) as recreation_feature,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'reserve_constraints_other')::text)) as reserve_constraints_other,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'reserve_constraints_comments')::text)) as reserve_constraints_comments,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'ecological_anchors_none')::text)) as ecological_anchors_none,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'bear_den')::text::integer as bear_den,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'hibernaculum')::text::integer as hibernaculum,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'vet_trees')::text)) as vet_trees,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'mineral_lick')::text::integer as mineral_lick,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'large_stick_nest')::text::integer as large_stick_nest,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'cavity_nest')::text::integer as cavity_nest,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'large_hollow_tree')::text::integer as large_hollow_tree,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'large_witches_broom')::text::integer as large_witches_broom,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'karst_feature')::text)) as karst_feature,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'large_tree_for_site')::text)) as large_tree_for_site,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'cwd_heavy_concentration')::text)) as cwd_heavy_concentration,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'active_wildlife_trails')::text)) as active_wildlife_trails,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'active_wlt_cwd_feeding')::text)) as active_wlt_cwd_feeding,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'uncommon_tree_species')::text)) as uncommon_tree_species,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'ecological_anchors_other')::text)) as ecological_anchors_other,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'ecological_anchors_comments')::text)) as ecological_anchors_comments
  
      from invasivesbc.activity_incoming_data
      where invasivesbc.activity_incoming_data.activity_type = 'FREP_FormB'
    and deleted_timestamp is null
      );
      COMMENT ON VIEW invasivesbc.FREP_FormC IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
  


    drop VIEW if exists invasivesbc.FREP_FormA cascade;
    CREATE OR REPLACE VIEW invasivesbc.FREP_FormA as (
      select
      activity_id as activity_id,
      version,

      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'date')::text))::timestamp as date,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'opening_id')::text)) as opening_id,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'assessed_by')::text)) as assessed_by,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'plot_number')::text)) as plot_number,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'stratum_id')::text)) as stratum_id,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'stratum_number')::text::integer as stratum_number,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'stratum_type')::text)) as stratum_type,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'utm_zone')::text)) as utm_zone,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'easting')::text::decimal as easting,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'northing')::text::decimal as northing,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'trees_exist')::text)) as trees_exist,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'baf')::text::decimal as baf,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'fixed_area')::text::decimal as fixed_area,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'full_count_area')::text::decimal as full_count_area,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'tree_comments')::text)) as tree_comments,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'cwd_in_transect')::text)) as cwd_in_transect,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'first_leg')::text::integer as first_leg,
      (activity_payload::json->'form_data'->'acitivity_subtype_data'->'second_leg')::text::integer as second_leg,
      trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'log_comments')::text)) as log_comments
  
      from invasivesbc.activity_incoming_data
      where invasivesbc.activity_incoming_data.activity_type = 'FREP_FormA'
    and deleted_timestamp is null
      );
      COMMENT ON VIEW invasivesbc.FREP_FormA IS 'View on fields common to all types of observations, with table activity_incoming_data as source.'; 
      
      

      drop VIEW if exists invasivesbc.FREP_Log cascade;
      CREATE OR REPLACE VIEW invasivesbc.FREP_Log as (
        select
        activity_id as activity_id,
        version,
  
        trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'species')::text)) as species,
        trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'decay_class')::text)) as decay_class,
        (activity_payload::json->'form_data'->'acitivity_subtype_data'->'diameter')::text::decimal as diameter,
        (activity_payload::json->'form_data'->'acitivity_subtype_data'->'length')::text::decimal as length
    
        from invasivesbc.activity_incoming_data
        where invasivesbc.activity_incoming_data.activity_type = 'FREP_Log'
      and deleted_timestamp is null
        );
        COMMENT ON VIEW invasivesbc.FREP_Log IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';  
  
  


        drop VIEW if exists invasivesbc.FREP_Stand_Table cascade;
        CREATE OR REPLACE VIEW invasivesbc.FREP_Stand_Table as (
          select
          activity_id as activity_id,
          version,
    
          trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'species')::text)) as species,
          trim('"' from((activity_payload::json->'form_data'->'acitivity_subtype_data'->'wt_class')::text)) as wt_class,
          (activity_payload::json->'form_data'->'acitivity_subtype_data'->'dbh')::text::decimal as dbh,
          (activity_payload::json->'form_data'->'acitivity_subtype_data'->'ht')::text::decimal as ht
        
          from invasivesbc.activity_incoming_data
          where invasivesbc.activity_incoming_data.activity_type = 'FREP_Stand_Table'
        and deleted_timestamp is null
          );
          COMMENT ON VIEW invasivesbc.FREP_Stand_Table IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';  
  
      `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`
  drop view if exists FREP_FormA cascade;
  drop view if exists FREP_FormB cascade;
  drop view if exists FREP_FormC cascade;
  drop view if exists FREP_Log cascade;
  drop view if exists FREP_Stand_Table cascade;
  `);
}
