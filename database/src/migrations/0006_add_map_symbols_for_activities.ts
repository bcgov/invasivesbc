import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc,public;

      alter table activity_incoming_data
        add column map_symbol text;

      CREATE OR REPLACE FUNCTION invasivesbc.update_map_symbol()
        RETURNS trigger
        LANGUAGE plpgsql
      AS
      $function$
      BEGIN
        set
          search_path = invasivesbc,
            public;
        with map_symbols as (select a.activity_incoming_data_id,
                                    string_agg(coalesce(species_positive.*, species_negative.*, species_treated.*), ', '
                                               order by coalesce(species_positive.*, species_negative.*, species_treated.*)) as species

                             from activity_incoming_data a

                                    left join jsonb_array_elements_text(case jsonb_typeof(species_positive)
                                                                          when 'array' then species_positive
                                                                          else '[]' end) species_positive on true
                                    left join jsonb_array_elements_text(case jsonb_typeof(species_negative)
                                                                          when 'array' then species_negative
                                                                          else '[]' end) species_negative on true
                                    left join jsonb_array_elements_text(case jsonb_typeof(species_treated)
                                                                          when 'array' then species_treated
                                                                          else '[]' end) species_treated on true

                             where a.iscurrent
                             group by a.activity_incoming_data_id)
        UPDATE
          activity_incoming_data aid
        set map_symbol = ms.species
        FROM map_symbols ms
        WHERE aid.activity_incoming_data_id = ms.activity_incoming_data_id
          and aid.activity_incoming_data_id = new.activity_incoming_data_id;
        RETURN NEW;
      END
      $function$;

      create or replace trigger map_symbol
        after
          insert
        on
          invasivesbc.activity_incoming_data
        for each row
      execute function invasivesbc.update_map_symbol();


      with map_symbols as (select a.activity_incoming_data_id,
                                  string_agg(coalesce(species_positive.*, species_negative.*, species_treated.*), ', '
                                             order by coalesce(species_positive.*, species_negative.*, species_treated.*)) as species

                           from activity_incoming_data a

                                  left join jsonb_array_elements_text(case jsonb_typeof(species_positive)
                                                                        when 'array' then species_positive
                                                                        else '[]' end) species_positive on true
                                  left join jsonb_array_elements_text(case jsonb_typeof(species_negative)
                                                                        when 'array' then species_negative
                                                                        else '[]' end) species_negative on true
                                  left join jsonb_array_elements_text(case jsonb_typeof(species_treated)
                                                                        when 'array' then species_treated
                                                                        else '[]' end) species_treated on true

                           where a.iscurrent
                           group by a.activity_incoming_data_id)
      UPDATE
        activity_incoming_data aid
      set map_symbol = ms.species
      FROM map_symbols ms
      WHERE aid.activity_incoming_data_id = ms.activity_incoming_data_id;

      CREATE INDEX activity_incoming_data_map_symbol_idx ON invasivesbc.activity_incoming_data USING btree (map_symbol);

    `
  );
}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path to invasivesbc, public;

      alter table activity_incoming_data
        drop column map_symbol;

    `
  );
}
