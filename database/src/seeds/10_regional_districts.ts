import { Knex } from 'knex';
import axios from 'axios';
import { ungzip } from 'node-gzip';

export async function seed(knex: Knex): Promise<void> {
  try {
    const url = 'https://nrs.objectstore.gov.bc.ca/seeds/regional_districts.sql.gz';
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const sql = await ungzip(data);

    // Clear the table
    const clear = 'truncate table public.regional_districts;';
    await knex.raw(clear);

    await knex.raw(sql.toString());
    await knex.raw(`
        DELETE FROM invasivesbc.application_user
    WHERE user_id=1;

    INSERT INTO invasivesbc.access_request (idir_account_name,bceid_account_name,first_name,last_name,primary_email,work_phone_number,funding_agencies,pac_number,employer,pac_service_number_1,pac_service_number_2,"comments",status,requested_roles,idir_userid,bceid_userid,created_at,updated_at,request_type) VALUES
         ('sawarren@idir','sawarren@idir','San','Warren','sam.warren@quartech.com',
        '2503197748','BCMIRR','123123','BCMF','123123','123123','asdfasdf','NOT_APPROVED',
    'master_administrator','25124583508C4D759AE6F2A771EDA4B5',NULL,'2022-04-04 11:21:59.507489','2022-04-04 11:21:59.507489','ACCESS');

    INSERT INTO invasivesbc.application_user (user_id, first_name,last_name,email,preferred_username,account_status,expiry_date,activation_status,active_session_id,created_at,updated_at,idir_userid,bceid_userid,idir_account_name,bceid_account_name,work_phone_number,funding_agencies,employer,pac_number,pac_service_number_1,pac_service_number_2) VALUES
       (1, 'Sam','Warren','sam.warren@quartech.com','sawarren@idir',1,'2023-02-18',1,NULL,
      '2022-02-18 18:35:11.888','2022-02-18 18:35:11.888','25124583508C4D759AE6F2A771EDA4B5',NULL,'sawarren@idir','sawarren@idir',NULL,
     'MOF','MOF','12345','691','17204');

    INSERT INTO invasivesbc.user_access (user_id,role_id,created_at,updated_at) VALUES
         (1,18,'2022-03-18 11:30:36.693','2022-03-18 11:30:36.693');
         INSERT INTO invasivesbc.user_access (user_id,role_id,created_at,updated_at) VALUES
         (1,19,'2022-03-18 11:30:36.693','2022-03-18 11:30:36.693');
        `);
  } catch (e) {
    console.log('failed to build sql for seed 10', e);
  }
}
