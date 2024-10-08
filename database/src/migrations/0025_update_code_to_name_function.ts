import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc, public;

      CREATE OR REPLACE FUNCTION invasivesbc.code_to_name()
        RETURNS trigger
        LANGUAGE plpgsql
      AS
      $function$
      BEGIN
        set
          search_path = invasivesbc,
            public;
        WITH species_code_by_activity_id AS (select aid.activity_incoming_data_id,
                                                    species_positive_col as positive_code,
                                                    species_negative_col as negative_code,
                                                    species_treated_col  as treated_code,
                                                    species_biocontrol   as biocontrol_code
                                             from activity_incoming_data aid
                                                    left join jsonb_array_elements_text(
                                               case jsonb_typeof(species_positive)
                                                 when 'array' then species_positive
                                                 else '[]' end
                                                              ) species_positive_col on true
                                                    left join jsonb_array_elements_text(
                                               case jsonb_typeof(species_negative)
                                                 when 'array' then species_negative
                                                 else '[]' end
                                                              ) species_negative_col on true
                                                    left join jsonb_array_elements_text(
                                               case jsonb_typeof(species_treated)
                                                 when 'array' then species_treated
                                                 else '[]' end
                                                              ) species_treated_col on true
                                                    left join jsonb_array_elements(
                                               case jsonb_typeof(
                                                 coalesce(
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Biocontrol_Collection_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Biocontrol_Release_Information}'))
                                                 when 'array' then coalesce(
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Biocontrol_Collection_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Biocontrol_Release_Information}')
                                                 else '[]' end
                                                              ) species_biocontrol on true
                                             where aid.iscurrent
                                               and aid.activity_incoming_data_id = new.activity_incoming_data_id),
             species_positive_translated_by_activity_id as (select im.char_code,
                                                                   sid.positive_code,
                                                                   im.invbc_name,
                                                                   sid.activity_incoming_data_id
                                                            from iapp_invbc_mapping im
                                                                   inner join species_code_by_activity_id sid on sid.positive_code = im.char_code),
             species_negative_translated_by_activity_id as (select im.char_code,
                                                                   sid.negative_code,
                                                                   im.invbc_name,
                                                                   sid.activity_incoming_data_id
                                                            from iapp_invbc_mapping im
                                                                   inner join species_code_by_activity_id sid on sid.negative_code = im.char_code),
             species_treated_translated_by_activity_id as (select im.char_code,
                                                                  sid.treated_code,
                                                                  im.invbc_name,
                                                                  sid.activity_incoming_data_id
                                                           from iapp_invbc_mapping im
                                                                  inner join species_code_by_activity_id sid on sid.treated_code = im.char_code),
             species_biocontrol_translated_by_activity_id as (select im.code_name,
                                                                     sid.biocontrol_code ->> 'biological_agent_code',
                                                                     im.code_description,
                                                                     sid.activity_incoming_data_id
                                                              from code im
                                                                     inner join species_code_by_activity_id sid
                                                                                on sid.biocontrol_code ->> 'biological_agent_code' = im.code_name
                                                              where im.code_header_id = 43),
             species_positive_description_aggregated_by_activity_id as (select array_to_string(
                                                                                 ARRAY_AGG(distinct st.invbc_name),
                                                                                 ', '
                                                                               ) as species_positive_full,
                                                                               st.activity_incoming_data_id
                                                                        from species_positive_translated_by_activity_id st
                                                                        group by st.activity_incoming_data_id),
             species_negative_description_aggregated_by_activity_id as (select array_to_string(
                                                                                 ARRAY_AGG(distinct st.invbc_name),
                                                                                 ', '
                                                                               ) as species_negative_full,
                                                                               st.activity_incoming_data_id
                                                                        from species_negative_translated_by_activity_id st
                                                                        group by st.activity_incoming_data_id),
             species_treated_description_aggregated_by_activity_id as (select array_to_string(
                                                                                ARRAY_AGG(distinct st.invbc_name),
                                                                                ', '
                                                                              ) as species_treated_full,
                                                                              st.activity_incoming_data_id
                                                                       from species_treated_translated_by_activity_id st
                                                                       group by st.activity_incoming_data_id),
             species_biocontrol_description_aggregated_by_activity_id as (select array_to_string(
                                                                                   ARRAY_AGG(distinct st.code_description),
                                                                                   ', '
                                                                                 ) as species_biocontrol_full,
                                                                                 st.activity_incoming_data_id
                                                                          from species_biocontrol_translated_by_activity_id st
                                                                          group by st.activity_incoming_data_id),
             species_full_descriptions_by_activity_id as (select a.activity_incoming_data_id,
                                                                 sp.species_positive_full,
                                                                 sn.species_negative_full,
                                                                 st.species_treated_full,
                                                                 sb.species_biocontrol_full
                                                          from activity_incoming_data a
                                                                 left join species_positive_description_aggregated_by_activity_id sp
                                                                           on sp.activity_incoming_data_id = a.activity_incoming_data_id
                                                                 left join species_negative_description_aggregated_by_activity_id sn
                                                                           on sn.activity_incoming_data_id = a.activity_incoming_data_id
                                                                 left join species_treated_description_aggregated_by_activity_id st
                                                                           on st.activity_incoming_data_id = a.activity_incoming_data_id
                                                                 left join species_biocontrol_description_aggregated_by_activity_id sb
                                                                           on sb.activity_incoming_data_id = a.activity_incoming_data_id
                                                          where a.iscurrent
                                                            and a.activity_incoming_data_id = new.activity_incoming_data_id)
        UPDATE
          activity_incoming_data aid
        set species_positive_full   = sf.species_positive_full,
            species_negative_full   = sf.species_negative_full,
            species_treated_full    = sf.species_treated_full,
            species_biocontrol_full = sf.species_biocontrol_full
        FROM species_full_descriptions_by_activity_id sf
        WHERE aid.activity_incoming_data_id = sf.activity_incoming_data_id
          and aid.activity_incoming_data_id = new.activity_incoming_data_id;
        RETURN NEW;
      END
      $function$
      ;


    `
  );
}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc, public;

      CREATE OR REPLACE FUNCTION invasivesbc.code_to_name() RETURNS trigger
        LANGUAGE plpgsql
      AS
      $$
      BEGIN
        set
          search_path = invasivesbc,
            public;
        WITH species_code_by_activity_id AS (select aid.activity_incoming_data_id,
                                                    aid.activity_id,
                                                    species_positive_col as positive_code,
                                                    species_negative_col as negative_code,
                                                    species_treated_col  as treated_code,
                                                    species_biocontrol   as biocontrol_code
                                             from activity_incoming_data aid
                                                    left join jsonb_array_elements_text(
                                               case jsonb_typeof(species_positive)
                                                 when 'array' then species_positive
                                                 else '[]' end
                                                              ) species_positive_col on true
                                                    left join jsonb_array_elements_text(
                                               case jsonb_typeof(species_negative)
                                                 when 'array' then species_negative
                                                 else '[]' end
                                                              ) species_negative_col on true
                                                    left join jsonb_array_elements_text(
                                               case jsonb_typeof(species_treated)
                                                 when 'array' then species_treated
                                                 else '[]' end
                                                              ) species_treated_col on true
                                                    left join jsonb_array_elements(
                                               case jsonb_typeof(
                                                 coalesce(
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Biocontrol_Collection_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Biocontrol_Release_Information}'))
                                                 when 'array' then coalesce(
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Biocontrol_Collection_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
                                                   activity_payload #>
                                                   '{form_data, activity_subtype_data, Biocontrol_Release_Information}')
                                                 else '[]' end
                                                              ) species_biocontrol on true
                                             where aid.iscurrent
                                               and aid.activity_id = new.activity_id),
             species_positive_translated_by_activity_id as (select im.char_code,
                                                                   sid.positive_code,
                                                                   im.invbc_name,
                                                                   sid.activity_id,
                                                                   sid.activity_incoming_data_id
                                                            from iapp_invbc_mapping im
                                                                   inner join species_code_by_activity_id sid on sid.positive_code = im.char_code),
             species_negative_translated_by_activity_id as (select im.char_code,
                                                                   sid.negative_code,
                                                                   im.invbc_name,
                                                                   sid.activity_id,
                                                                   sid.activity_incoming_data_id
                                                            from iapp_invbc_mapping im
                                                                   inner join species_code_by_activity_id sid on sid.negative_code = im.char_code),
             species_treated_translated_by_activity_id as (select im.char_code,
                                                                  sid.treated_code,
                                                                  im.invbc_name,
                                                                  sid.activity_id,
                                                                  sid.activity_incoming_data_id
                                                           from iapp_invbc_mapping im
                                                                  inner join species_code_by_activity_id sid on sid.treated_code = im.char_code),
             species_biocontrol_translated_by_activity_id as (select im.code_name,
                                                                     sid.biocontrol_code ->> 'biological_agent_code',
                                                                     im.code_description,
                                                                     sid.activity_id,
                                                                     sid.activity_incoming_data_id
                                                              from code im
                                                                     inner join species_code_by_activity_id sid
                                                                                on sid.biocontrol_code ->> 'biological_agent_code' = im.code_name
                                                              where im.code_header_id = 43),
             species_positive_description_aggregated_by_activity_id as (select array_to_string(
                                                                                 ARRAY_AGG(distinct st.invbc_name),
                                                                                 ', '
                                                                               ) as species_positive_full,
                                                                               st.activity_id,
                                                                               st.activity_incoming_data_id
                                                                        from species_positive_translated_by_activity_id st
                                                                        group by st.activity_id,
                                                                                 st.activity_incoming_data_id),
             species_negative_description_aggregated_by_activity_id as (select array_to_string(
                                                                                 ARRAY_AGG(distinct st.invbc_name),
                                                                                 ', '
                                                                               ) as species_negative_full,
                                                                               st.activity_id,
                                                                               st.activity_incoming_data_id
                                                                        from species_negative_translated_by_activity_id st
                                                                        group by st.activity_id,
                                                                                 st.activity_incoming_data_id),
             species_treated_description_aggregated_by_activity_id as (select array_to_string(
                                                                                ARRAY_AGG(distinct st.invbc_name),
                                                                                ', '
                                                                              ) as species_treated_full,
                                                                              st.activity_id,
                                                                              st.activity_incoming_data_id
                                                                       from species_treated_translated_by_activity_id st
                                                                       group by st.activity_id,
                                                                                st.activity_incoming_data_id),
             species_biocontrol_description_aggregated_by_activity_id as (select array_to_string(
                                                                                   ARRAY_AGG(distinct st.code_description),
                                                                                   ', '
                                                                                 ) as species_biocontrol_full,
                                                                                 st.activity_id,
                                                                                 st.activity_incoming_data_id
                                                                          from species_biocontrol_translated_by_activity_id st
                                                                          group by st.activity_id,
                                                                                   st.activity_incoming_data_id),
             species_full_descriptions_by_activity_id as (select a.activity_id,
                                                                 a.activity_incoming_data_id,
                                                                 sp.species_positive_full,
                                                                 sn.species_negative_full,
                                                                 st.species_treated_full,
                                                                 sb.species_biocontrol_full
                                                          from activity_incoming_data a
                                                                 left join species_positive_description_aggregated_by_activity_id sp
                                                                           on sp.activity_id = a.activity_id
                                                                 left join species_negative_description_aggregated_by_activity_id sn
                                                                           on sn.activity_id = a.activity_id
                                                                 left join species_treated_description_aggregated_by_activity_id st
                                                                           on st.activity_id = a.activity_id
                                                                 left join species_biocontrol_description_aggregated_by_activity_id sb
                                                                           on sb.activity_id = a.activity_id
                                                          where a.iscurrent
                                                            and a.activity_id = new.activity_id)
        UPDATE
          activity_incoming_data aid
        set species_positive_full   = sf.species_positive_full,
            species_negative_full   = sf.species_negative_full,
            species_treated_full    = sf.species_treated_full,
            species_biocontrol_full = sf.species_biocontrol_full
        FROM species_full_descriptions_by_activity_id sf
        WHERE aid.activity_incoming_data_id = sf.activity_incoming_data_id
          and aid.activity_incoming_data_id = new.activity_incoming_data_id
          and aid.activity_id = new.activity_id;
        RETURN NEW;
      END
      $$;


    `
  );
}
