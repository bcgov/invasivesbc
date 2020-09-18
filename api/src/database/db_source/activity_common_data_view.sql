CREATE OR REPLACE VIEW activity_common_fields_view as (
select 
'banana' as activity_id,
'banana' as activity_type,
'banana' as activity_subtype,
'banana' as planned_activity_date_time,
'banana' as actual_activity_date_time,
'banana' as primary_user_first_name,
'banana' as primary_user_last_name,
'banana' as secondary_user_first_name,
'banana' as secondary_user_last_name,
'banana' as species,
'banana' as business_area,
'banana' as jurisdiction,
'banana' as agency
'banana' as created_at,
'banana' as updated_at,
'banana' as updated_by_user_id,
'banana' as created_by_user_id,

from activity_incoming_data
)
COMMENT ON VIEW activity_common_fields_view IS 'View on fields common to all types of activities, with table activity_incoming_data as source.';
