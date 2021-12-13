drop table if exists jamies_test_data;

create table jamies_test_data as
select
    *
from
    activity_incoming_data
where
    ownership = 'Jamie'
;

-- Now log into the container and extract
-- pg_dump -t jamies_test_data -U invasivebc -f /tmp/jamies_test_data-13dec2021.sql InvasivesBC
