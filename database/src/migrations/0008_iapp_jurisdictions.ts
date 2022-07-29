import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  	set search_path=invasivesbc,public;

    CREATE TABLE IF NOT EXISTS iapp_jurisdictions (
      id SERIAL PRIMARY KEY,
      jurisdiction VARCHAR(70) NOT NULL,
      code VARCHAR(10)
    );

    GRANT SELECT ON iapp_jurisdictions TO invasivebc;

    INSERT INTO iapp_jurisdictions(jurisdiction) VALUES
      ('CP Rail'),
      ('Grazing Lease'),
      ('FortisBC Inc'),
      ('EXPIRED - British Columbia Transmission Corporation'),
      ('CN Rail'),
      ('Oil and Gas Companies'),
      ('Ministry of Forests, Lands and Natural Resource Operations'),
      ('Provincial Parks'),
      ('TransCanada Pipelines'),
      ('BC Hydro');
    INSERT INTO iapp_jurisdictions(jurisdiction) VALUES
      ('Mining Companies'),
      ('Gas and Oil'),
      ('Regional District owned land'),
      ('BC Rail'),
      ('Municipality owned land'),
      ('EXPIRED - Terasen Gas Inc.'),
      ('Westcoast Energy Inc.'),
      ('OBSOLETE - Railroads'),
      ('First Nations Reserves');
    INSERT INTO iapp_jurisdictions(jurisdiction) VALUES
      ('EXPIRED - Ministry of Environment - except Provincial Parks'),
      ('Parks Canada'),
      ('OBSOLETE - Municipality'),
      ('Department of Transportation'),
      ('Private Land'),
      ('Department of National Defense'),
      ('Ministry of Transportation and Infrastructure'),
      ('OBSOLETE - Pipelines'),
      ('IAPP Conversion - Jurisdiction not recorded');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;
    drop table if exists invasivesbc.iapp_jurisdictions;
  `);
}
