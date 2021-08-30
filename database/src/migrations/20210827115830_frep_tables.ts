import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`
  set search_path = invasivesbc;
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
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'opening_number')::text)) as opening_number,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'opening_id')::text)) as opening_id,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'license_number')::text)) as license_number,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'cp_number')::text)) as cp_number,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'block')::text)) as block,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'licensee')::text)) as licensee,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'district_code')::text)) as district_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'location_description')::text)) as location_description,
    (activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'nar')::text::decimal as nar,
    (activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'gross_area')::text::decimal as gross_area,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'opening_identification'->'override_code')::text)) as override_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'innovative_practices'->'innovative_practices')::text)) as innovative_practices,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plants'->'invasive_code')::text)) as invasive_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'evaluator_opinion'->'evaluator_opinion_code')::text)) as evaluator_opinion_code,
    trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'evaluator_opinion'->'rationale')::text)) as rationale,
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
    where invasivesbc.activity_incoming_data.activity_type = 'FREP'
	and deleted_timestamp is null
    );
    COMMENT ON VIEW invasivesbc.FREP_FormC IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
  drop VIEW if exists invasivesbc.FREP_FormB cascade;
  CREATE OR REPLACE VIEW invasivesbc.FREP_FormB as (
      with obj_array as (
        select activity_incoming_data_id,
          (
            (
              activity_payload::json->'form_data'->'activity_subtype_data'->'form_b'
            )
          ) as my_array,
          activity_id as activity_id
        from invasivesbc.activity_incoming_data
        where invasivesbc.activity_incoming_data.activity_type = 'FREP'
          and deleted_timestamp is null
      ),
      stratum_summary_obj as (
        select obj_array.activity_incoming_data_id,
          obj_array.activity_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_b.stratum_summary
        from obj_array,
          json_to_recordset(obj_array.my_array) as form_b(stratum_summary jsonb)
      ),
      dispersed_summary_obj as (
        select obj_array.activity_incoming_data_id,
          obj_array.activity_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_b.dispersed_summary
        from obj_array,
          json_to_recordset(obj_array.my_array) as form_b(dispersed_summary jsonb)
      ),
      ecological_anchors_obj as (
        select obj_array.activity_incoming_data_id,
          obj_array.activity_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_b.ecological_anchors
        from obj_array,
          json_to_recordset(obj_array.my_array) as form_b(ecological_anchors jsonb)
      ),
      reserve_constraints_obj as (
        select obj_array.activity_incoming_data_id,
          obj_array.activity_id,
          row_number() over (
            order by activity_incoming_data_id
          ) as row_number,
          form_b.reserve_constraints
        from obj_array,
          json_to_recordset(obj_array.my_array) as form_b(reserve_constraints jsonb)
      ),
      stratum_summary_fields_query as (
        select CONCAT(activity_id, '-b-', row_number) as form_b_id,
          activity_id,
          stratum_summary_fields.date,
          stratum_summary_fields.subzone,
          stratum_summary_fields.variant,
          stratum_summary_fields.bec_zone,
          stratum_summary_fields.opening_id,
          stratum_summary_fields.stratum_id,
          stratum_summary_fields.assessed_by,
          stratum_summary_fields.site_series,
          stratum_summary_fields.estimated_size,
          stratum_summary_fields.stratum_number,
          stratum_summary_fields.num_plots_stratum,
          stratum_summary_fields.mapped_stratum_size,
          stratum_summary_fields.stratum_location_consistent
        from stratum_summary_obj,
          jsonb_to_record(stratum_summary_obj.stratum_summary) as stratum_summary_fields(
            form_b_id text,
            date timestamp,
            subzone text,
            variant text,
            bec_zone text,
            opening_id text,
            stratum_id text,
            assessed_by text,
            site_series text,
            estimated_size integer,
            stratum_number text,
            num_plots_stratum integer,
            mapped_stratum_size integer,
            stratum_location_consistent text
          )
      ),
      dispersed_summary_fields_query as (
        select CONCAT(activity_id, '-b-', row_number) as form_b_id,
          dispersed_summary_fields.patch_location,
          dispersed_summary_fields.windthrow_treatment,
          dispersed_summary_fields.windthrow_distribution,
          dispersed_summary_fields.percent_trees_windthrown,
          dispersed_summary_fields.estimated_age_of_oldest_trees
        from dispersed_summary_obj,
          jsonb_to_record(dispersed_summary_obj.dispersed_summary) as dispersed_summary_fields(
            form_b_id text,
            patch_location text,
            windthrow_treatment text,
            windthrow_distribution text,
            percent_trees_windthrown text,
            estimated_age_of_oldest_trees integer
          )
      ),
      ecological_anchors_fields_query as (
        select CONCAT(activity_id, '-b-', row_number) as form_b_id,
          ecological_anchors_fields.bear_den,
          ecological_anchors_fields.vet_trees,
          ecological_anchors_fields.cavity_nest,
          ecological_anchors_fields.hibernaculum,
          ecological_anchors_fields.mineral_lick,
          ecological_anchors_fields.karst_feature,
          ecological_anchors_fields.large_stick_nest,
          ecological_anchors_fields.large_hollow_tree,
          ecological_anchors_fields.large_tree_for_site,
          ecological_anchors_fields.large_witches_broom,
          ecological_anchors_fields.uncommon_tree_species,
          ecological_anchors_fields.active_wildlife_trails,
          ecological_anchors_fields.active_wlt_cwd_feeding,
          ecological_anchors_fields.cwd_heavy_concentration,
          ecological_anchors_fields.ecological_anchors_none,
          ecological_anchors_fields.ecological_anchors_other,
          ecological_anchors_fields.ecological_anchors_comments
        from ecological_anchors_obj,
          jsonb_to_record(ecological_anchors_obj.ecological_anchors) as ecological_anchors_fields(
            form_b_id text,
            bear_den integer,
            vet_trees text,
            cavity_nest integer,
            hibernaculum integer,
            mineral_lick integer,
            karst_feature text,
            large_stick_nest integer,
            large_hollow_tree integer,
            large_tree_for_site text,
            large_witches_broom integer,
            uncommon_tree_species text,
            active_wildlife_trails text,
            active_wlt_cwd_feeding text,
            cwd_heavy_concentration text,
            ecological_anchors_none text,
            ecological_anchors_other text,
            ecological_anchors_comments text
          )
      ),
      reserve_constraints_fields_query as (
        select CONCAT(activity_id, '-b-', row_number) as form_b_id,
          reserve_constraints_fields.rmz,
          reserve_constraints_fields.rrz,
          reserve_constraints_fields.ogma,
          reserve_constraints_fields.visuals,
          reserve_constraints_fields.wetsite,
          reserve_constraints_fields.uwr_wha_whf,
          reserve_constraints_fields.rock_outcrop,
          reserve_constraints_fields.sensitive_terrain,
          reserve_constraints_fields.recreation_feature,
          reserve_constraints_fields.noncommercial_brush,
          reserve_constraints_fields.low_mercantile_timber,
          reserve_constraints_fields.reserve_constraints_none,
          reserve_constraints_fields.cultural_heritage_feature,
          reserve_constraints_fields.reserve_constraints_other,
          reserve_constraints_fields.reserve_constraints_comments
        from reserve_constraints_obj,
          jsonb_to_record(reserve_constraints_obj.reserve_constraints) as reserve_constraints_fields(
            form_b_id text,
            rmz text,
            rrz text,
            ogma text,
            visuals text,
            wetsite text,
            uwr_wha_whf text,
            rock_outcrop text,
            sensitive_terrain text,
            recreation_feature text,
            noncommercial_brush text,
            low_mercantile_timber text,
            reserve_constraints_none text,
            cultural_heritage_feature text,
            reserve_constraints_other text,
            reserve_constraints_comments text
          )
      )
      select stratum_summary_fields_query.activity_id,
        stratum_summary_fields_query.form_b_id,
        stratum_summary_fields_query.date,
        stratum_summary_fields_query.subzone,
        stratum_summary_fields_query.variant,
        stratum_summary_fields_query.bec_zone,
        stratum_summary_fields_query.opening_id,
        stratum_summary_fields_query.stratum_id,
        stratum_summary_fields_query.assessed_by,
        stratum_summary_fields_query.site_series,
        stratum_summary_fields_query.estimated_size,
        stratum_summary_fields_query.stratum_number,
        stratum_summary_fields_query.num_plots_stratum,
        stratum_summary_fields_query.mapped_stratum_size,
        stratum_summary_fields_query.stratum_location_consistent,
        dispersed_summary_fields_query.patch_location,
        dispersed_summary_fields_query.windthrow_treatment,
        dispersed_summary_fields_query.windthrow_distribution,
        dispersed_summary_fields_query.percent_trees_windthrown,
        dispersed_summary_fields_query.estimated_age_of_oldest_trees,
        ecological_anchors_fields_query.bear_den,
        ecological_anchors_fields_query.vet_trees,
        ecological_anchors_fields_query.cavity_nest,
        ecological_anchors_fields_query.hibernaculum,
        ecological_anchors_fields_query.mineral_lick,
        ecological_anchors_fields_query.karst_feature,
        ecological_anchors_fields_query.large_stick_nest,
        ecological_anchors_fields_query.large_hollow_tree,
        ecological_anchors_fields_query.large_tree_for_site,
        ecological_anchors_fields_query.large_witches_broom,
        ecological_anchors_fields_query.uncommon_tree_species,
        ecological_anchors_fields_query.active_wildlife_trails,
        ecological_anchors_fields_query.active_wlt_cwd_feeding,
        ecological_anchors_fields_query.cwd_heavy_concentration,
        ecological_anchors_fields_query.ecological_anchors_none,
        ecological_anchors_fields_query.ecological_anchors_other,
        ecological_anchors_fields_query.ecological_anchors_comments,
        reserve_constraints_fields_query.rmz,
        reserve_constraints_fields_query.rrz,
        reserve_constraints_fields_query.ogma,
        reserve_constraints_fields_query.visuals,
        reserve_constraints_fields_query.wetsite,
        reserve_constraints_fields_query.uwr_wha_whf,
        reserve_constraints_fields_query.rock_outcrop,
        reserve_constraints_fields_query.sensitive_terrain,
        reserve_constraints_fields_query.recreation_feature,
        reserve_constraints_fields_query.noncommercial_brush,
        reserve_constraints_fields_query.low_mercantile_timber,
        reserve_constraints_fields_query.reserve_constraints_none,
        reserve_constraints_fields_query.cultural_heritage_feature,
        reserve_constraints_fields_query.reserve_constraints_other,
        reserve_constraints_fields_query.reserve_constraints_comments
      from stratum_summary_fields_query
        inner join dispersed_summary_fields_query on stratum_summary_fields_query.form_b_id = dispersed_summary_fields_query.form_b_id
        inner join ecological_anchors_fields_query on stratum_summary_fields_query.form_b_id = ecological_anchors_fields_query.form_b_id
        inner join reserve_constraints_fields_query on stratum_summary_fields_query.form_b_id = reserve_constraints_fields_query.form_b_id
    );
  drop VIEW if exists invasivesbc.FREP_FormA cascade;
  CREATE OR REPLACE VIEW invasivesbc.FREP_FormA as (
      with obj_array as (
        select activity_incoming_data_id,
          (
            (
              activity_payload::json->'form_data'->'activity_subtype_data'->'form_b'
            )
          ) as my_array,
          activity_id as activity_id
        from invasivesbc.activity_incoming_data
        where invasivesbc.activity_incoming_data.activity_type = 'FREP'
          and deleted_timestamp is null
      ),
      -- extract the stratum_summary section from form b
      form_a_array as (
        select obj_array.activity_incoming_data_id,
          obj_array.activity_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_b.form_a
        from obj_array,
          json_to_recordset(obj_array.my_array) as form_b(form_a jsonb)
      ),
      form_a_obj as (
        select form_a as my_array,
          activity_incoming_data_id,
          activity_id
        from form_a_array
      ),
      plot_identification_obj as (
        select form_a_obj.activity_id,
          form_a_obj.activity_incoming_data_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_a.plot_identification
        from form_a_obj,
          jsonb_to_recordset(form_a_obj.my_array) as form_a(plot_identification jsonb)
      ),
      plot_information_obj as (
        select form_a_obj.activity_id,
          form_a_obj.activity_incoming_data_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_a.plot_information
        from form_a_obj,
          jsonb_to_recordset(form_a_obj.my_array) as form_a(plot_information jsonb)
      ),
      plot_identification_trees_obj as (
        select form_a_obj.activity_id,
          form_a_obj.activity_incoming_data_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_a.plot_identification_trees
        from form_a_obj,
          jsonb_to_recordset(form_a_obj.my_array) as form_a(plot_identification_trees jsonb)
      ),
      plot_information_fields_query as (
        select CONCAT(activity_id, '-a-', row_number) as form_a_id,
          activity_id,
          plot_information_fields.first_leg,
          plot_information_fields.second_leg,
          plot_information_fields.log_comments,
          plot_information_fields.cwd_in_transect
        from plot_information_obj,
          jsonb_to_record(plot_information_obj.plot_information) as plot_information_fields(
            form_a_id text,
            first_leg integer,
            second_leg integer,
            log_comments text,
            cwd_in_transect text
          )
      ),
      plot_identification_fields_query as (
        select CONCAT(activity_id, '-a-', row_number) as form_a_id,
          plot_identification_fields.date,
          plot_identification_fields.easting,
          plot_identification_fields.northing,
          plot_identification_fields.utm_zone,
          plot_identification_fields.opening_id,
          plot_identification_fields.stratum_id,
          plot_identification_fields.assessed_by,
          plot_identification_fields.plot_number,
          plot_identification_fields.stratum_type,
          plot_identification_fields.stratum_number
        from plot_identification_obj,
          jsonb_to_record(plot_identification_obj.plot_identification) as plot_identification_fields(
            date timestamp,
            easting integer,
            northing integer,
            utm_zone text,
            opening_id text,
            stratum_id text,
            assessed_by text,
            plot_number integer,
            stratum_type text,
            stratum_number text
          )
      ),
      plot_identification_trees_fields_query as (
        select CONCAT(activity_id, '-a-', row_number) as form_a_id,
          plot_identification_trees_fields.baf,
          plot_identification_trees_fields.fixed_area,
          plot_identification_trees_fields.trees_exist,
          plot_identification_trees_fields.full_count_area,
          tree_comments
        from plot_identification_trees_obj,
          jsonb_to_record(
            plot_identification_trees_obj.plot_identification_trees
          ) as plot_identification_trees_fields(
            baf text,
            fixed_area integer,
            trees_exist text,
            full_count_area integer,
            tree_comments text
          )
      )
      select plot_information_fields_query.form_a_id,
        plot_information_fields_query.activity_id,
        plot_information_fields_query.first_leg,
        plot_information_fields_query.second_leg,
        plot_information_fields_query.log_comments,
        plot_information_fields_query.cwd_in_transect,
        plot_identification_fields_query.date,
        plot_identification_fields_query.easting,
        plot_identification_fields_query.northing,
        plot_identification_fields_query.utm_zone,
        plot_identification_fields_query.opening_id,
        plot_identification_fields_query.stratum_id,
        plot_identification_fields_query.assessed_by,
        plot_identification_fields_query.plot_number,
        plot_identification_fields_query.stratum_type,
        plot_identification_fields_query.stratum_number,
        plot_identification_trees_fields_query.baf,
        plot_identification_trees_fields_query.fixed_area,
        plot_identification_trees_fields_query.trees_exist,
        plot_identification_trees_fields_query.full_count_area,
        plot_identification_trees_fields_query.tree_comments
      from plot_information_fields_query
        inner join plot_identification_fields_query on plot_information_fields_query.form_a_id = plot_identification_fields_query.form_a_id
        inner join plot_identification_trees_fields_query on plot_information_fields_query.form_a_id = plot_identification_trees_fields_query.form_a_id
    );
  set search_path = invasivesbc;
  drop VIEW if exists invasivesbc.FREP_Log cascade;
  CREATE OR REPLACE VIEW invasivesbc.FREP_Log as (
      with obj_array as (
        select activity_incoming_data_id,
          (
            (
              activity_payload::json->'form_data'->'activity_subtype_data'->'form_b'
            )
          ) as my_array,
          activity_id as activity_id
        from invasivesbc.activity_incoming_data
        where invasivesbc.activity_incoming_data.activity_type = 'FREP'
          and deleted_timestamp is null
      ),
      form_a_array as (
        select obj_array.activity_incoming_data_id,
          obj_array.activity_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_b.form_a
        from obj_array,
          json_to_recordset(obj_array.my_array) as form_b(form_a jsonb)
      ),
      form_a_obj as (
        select form_a as my_array,
          activity_incoming_data_id,
          activity_id
        from form_a_array
      ),
      plot_information_obj as (
        select form_a_obj.activity_id,
          form_a_obj.activity_incoming_data_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_a.plot_information
        from form_a_obj,
          jsonb_to_recordset(form_a_obj.my_array) as form_a(plot_information jsonb)
      ),
      plot_information_fields_query as (
        select CONCAT(activity_id, '-log-', row_number) as form_a_id,
          activity_id,
          plot_information_fields.first_leg,
          plot_information_fields.second_leg,
          plot_information_fields.log_comments,
          plot_information_fields.cwd_in_transect,
          plot_information_fields.log
        from plot_information_obj,
          jsonb_to_record(plot_information_obj.plot_information) as plot_information_fields(
            form_a_id text,
            first_leg integer,
            second_leg integer,
            log_comments text,
            cwd_in_transect text,
            log jsonb
          )
      ),
      log_obj as (
        select form_a_id as log_id,
          activity_id,
          log as my_array
        from plot_information_fields_query
      ),
      log_query as (
        select activity_id,
          log_obj.log_id,
          frep_log.length,
          frep_log.log_num,
          frep_log.species,
          frep_log.diameter,
          frep_log.decay_class
        from log_obj,
          jsonb_to_recordset(log_obj.my_array) as frep_log(
            length integer,
            log_num integer,
            species text,
            diameter integer,
            decay_class text
          )
      )
      select *
      from log_query
    );
  set search_path = invasivesbc;
  drop VIEW if exists invasivesbc.FREP_Stand_Table cascade;
  CREATE OR REPLACE VIEW invasivesbc.FREP_Stand_Table as (
      with obj_array as (
        select activity_incoming_data_id,
          (
            (
              activity_payload::json->'form_data'->'activity_subtype_data'->'form_b'
            )
          ) as my_array,
          activity_id as activity_id
        from invasivesbc.activity_incoming_data
        where invasivesbc.activity_incoming_data.activity_type = 'FREP'
          and deleted_timestamp is null
      ),
      form_a_array as (
        select obj_array.activity_incoming_data_id,
          obj_array.activity_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_b.form_a
        from obj_array,
          json_to_recordset(obj_array.my_array) as form_b(form_a jsonb)
      ),
      form_a_obj as (
        select form_a as my_array,
          activity_incoming_data_id,
          activity_id
        from form_a_array
      ),
      stand_table_array as (
        select form_a_obj.activity_id,
          form_a_obj.activity_incoming_data_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          form_a.stand_table
        from form_a_obj,
          jsonb_to_recordset(form_a_obj.my_array) as form_a(stand_table jsonb)
      ),
      stand_table_obj as (
        select stand_table as my_array,
          activity_incoming_data_id,
          activity_id
        from stand_table_array
      ),
      stand_table_query as (
        select stand_table_obj.activity_id,
          stand_table_obj.activity_incoming_data_id,
          row_number() over (
            order by activity_incoming_data_id
          ),
          stand_table.ht,
          stand_table.dbh,
          stand_table.species,
          stand_table.tree_num,
          stand_table.wt_class
        from stand_table_obj,
          jsonb_to_recordset(stand_table_obj.my_array) as stand_table(
            form_a_id text,
            ht integer,
            dbh integer,
            species text,
            tree_num integer,
            wt_class text
          )
      ),
      stand_table_parser as (
        select CONCAT(activity_id, '-stand_table-', row_number) as stand_table_id,
          activity_id,
          ht,
          dbh,
          species,
          tree_num,
          wt_class
        from stand_table_query
      )
      select *
      from stand_table_parser
    );
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
