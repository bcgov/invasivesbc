import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
-- update jurisdiction code descriptions
update
	invasivesbc.code
set
	code_description = case
		when code_name = 'LWRS' then 'Ministry of Water Land and Resource Stewardship'
		when code_name = 'MOE' then 'Ministry of Environment and Parks'
		when code_name = 'MOTI' then 'Ministry of Transportation and Transit'
		else code_description
	end
where
	code_header_id = 45
	and code_name in ('LWRS', 'MOE', 'MOTI');


-- delete a funding agency, add two funding agencies, update funding agency descriptions
delete from invasivesbc.code where code_header_id = 44 and code_name = 'EMLCI';

INSERT INTO invasivesbc.code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(44, 'MMCM', 'BC Ministry of Mining and Critical Minerals', 1, now(), null, now(), now(), 1, 1);

INSERT INTO invasivesbc.code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(44, 'MECS', 'BC Ministry of Energy and Climate Solutions', 1, now(), null, now(), now(), 1, 1);   
	
update
	invasivesbc.code
set
	code_description = case
		when code_name = 'EDU' then 'BC Ministry of Education and Child Care'
		when code_name = 'JERI' then 'BC Ministry of Jobs Economic Development and Innovation'
		when code_name = 'LWRS' then 'BC Ministry of Water Land and Resource Stewardship'
		when code_name = 'MOE' then 'BC Ministry of Environment and Parks'
		when code_name = 'MOTI' then 'BC Ministry of Transportation and Transit'
		else code_description
	end
where
	code_header_id = 44
	and code_name in ('EDU', 'JERI', 'LWRS', 'MOE', 'MOTI');


-- delete an employer, add two employers, update employer descriptions
delete from invasivesbc.code where code_header_id = 79 and code_name = 'EMLCI';

INSERT INTO invasivesbc.code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(79, 'MMCM', 'BC Ministry of Mining and Critical Minerals', 1, now(), null, now(), now(), 1, 1);

INSERT INTO invasivesbc.code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(79, 'MECS', 'BC Ministry of Energy and Climate Solutions', 1, now(), null, now(), now(), 1, 1);
   
update
	invasivesbc.code
set
	code_description = case
		when code_name = 'AEST' then 'BC Ministry of Post-Secondary Education and Future Skills'
		when code_name = 'EDU' then 'BC Ministry of Education and Child Care'
		when code_name = 'JERI' then 'BC Ministry of Jobs Economic Development and Innovation'
		when code_name = 'LWRS' then 'BC Ministry of Water Land and Resource Stewardship'
		when code_name = 'MOE' then 'BC Ministry of Environment and Parks'
		when code_name = 'MOTI' then 'BC Ministry of Transportation and Transit'
		when code_name = 'MUNI' then 'BC Ministry of Housing and Municipal Affairs'
		when code_name = 'PSSG' then 'BC Ministry of Public Safety and Solicitor General'
		else code_description
	end
where
	code_header_id = 79
	and code_name in ('AEST', 'EDU', 'JERI', 'LWRS', 'MOE', 'MOTI', 'MUNI', 'PSSG');


-- re-sort jurisdictions, funding agencies, and employers
update
	invasivesbc.code as c
    set
	code_sort_order = subquery.row_number
from
	(
	select
		code_id,
		row_number() over (partition by code_header_id
	order by
		code_header_id,
		code_description) as row_number
	from
		invasivesbc.code
	where
		code_header_id in (44, 45, 79)
    ) as subquery
where
	c.code_id = subquery.code_id
	and code_header_id in (44, 45, 79);
    `
  );
}

export async function down(knex: Knex) {
  //language=PostgreSQL
  await knex.raw(
    `
-- update jurisdiction code descriptions
update
	invasivesbc.code
set
	code_description = case
		when code_name = 'LWRS' then 'Ministry of Land Water Resource Stewardship'
		when code_name = 'MOE' then 'Ministry of Environment & Climate Change Strategy'
		when code_name = 'MOTI' then 'Ministry of Transportation and Infrastructure'
		else code_description
	end
where
	code_header_id = 45
	and code_name in ('LWRS', 'MOE', 'MOTI');


-- delete a funding agency, add two funding agencies, update funding agency descriptions
delete from invasivesbc.code where code_header_id = 44 and code_name in ('MMCM', 'MECS');

INSERT INTO invasivesbc.code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(44, 'EMLCI', 'BC Ministry of Energy Mines and Low Carbon Innovation', 1, now(), null, now(), now(), 1, 1); 
	
update
	invasivesbc.code
set
	code_description = case
		when code_name = 'EDU' then 'BC Ministry of Education'
		when code_name = 'JERI' then 'BC Ministry of Jobs Economic Recovery and Innovation'
		when code_name = 'LWRS' then 'BC Ministry of Land Water Resource Stewardship'
		when code_name = 'MOE' then 'BC Ministry of Environment & Climate Change Strategy'
		when code_name = 'MOTI' then 'BC Ministry of Transportation & Infrastructure'
		else code_description
	end
where
	code_header_id = 44
	and code_name in ('EDU', 'JERI', 'LWRS', 'MOE', 'MOTI');


-- delete an employer, add two employers, update employer descriptions
delete from invasivesbc.code where code_header_id = 79 and code_name in ('MMCM', 'MECS');

INSERT INTO invasivesbc.code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(79, 'EMLCI', 'BC Ministry of Energy Mines and Low Carbon Innovation', 1, now(), null, now(), now(), 1, 1);
   
update
	invasivesbc.code
set
	code_description = case
		when code_name = 'AEST' then 'BC Ministry of Advanced Education and Skills Training'
		when code_name = 'EDU' then 'BC Ministry of Education'
		when code_name = 'JERI' then 'BC Ministry of Jobs Economic Recovery and Innovation'
		when code_name = 'LWRS' then 'BC Ministry of Land Water and Resource Stewardship'
		when code_name = 'MOE' then 'BC Ministry of Environment & Climate Change Strategy'
		when code_name = 'MOTI' then 'BC Ministry of Transportation & Infrastructure'
		when code_name = 'MUNI' then 'BC Ministry of Municipal Affairs'
		when code_name = 'PSSG' then 'BC Ministry of Public Safety & Solicitor General & Emergency B.C.'
		else code_description
	end
where
	code_header_id = 79
	and code_name in ('AEST', 'EDU', 'JERI', 'LWRS', 'MOE', 'MOTI', 'MUNI', 'PSSG');


-- re-sort jurisdictions, funding agencies, and employers
update
	invasivesbc.code as c
    set
	code_sort_order = subquery.row_number
from
	(
	select
		code_id,
		row_number() over (partition by code_header_id
	order by
		code_header_id,
		code_description) as row_number
	from
		invasivesbc.code
	where
		code_header_id in (44, 45, 79)
    ) as subquery
where
	c.code_id = subquery.code_id
	and code_header_id in (44, 45, 79); 

    `
  );
}
