echo $1
curl --location --request POST 'localhost:3002/api/activity' \
--header 'Authorization: Bearer '${1} \
--header 'Content-Type: application/json' \
--data-raw '
{
	"activity_type": "Observation",
	"activity_sub_type": "Terrestrial Invasive Plant",
	"date": "2019-04-12",
	"deviceRequestUID": "string",
	"locationAndGeometry": {
		"anchorPointY": 0,
		"anchorPointX": 0,
		"area": 0,
		"geometry": {},
		"jurisdiction": "string",
		"agency": "string",
		"observer1FirstName": "string",
		"observer1LastName": "string",
		"locationComment": "string",
		"generalComment": "string",
		"photoTaken": true
	},
	"activityTypeData": {
		"negative_observation_ind": false,
		"aquatic_observation_ind": false,
		"primary_user_last_name": "mike",
		"secondary_user_first_name": "mike",
		"secondary_user_last_name": "mike",
		"species": "banana",
		"primary_file_id": "test",
		"secondary_file_id": "test",
		"location_comment": "test",
		"general_observation_comment": "general comment",
		"sample_taken_ind": true,
		"sample_label_number": "string"
	},
	"activitySubTypeData": {
		"species": "banana",
		"distribution": 123,
		"density": 123,
		"soil_texture": 1,
		"slope": 123,
		"aspect": 123,
		"flowering": true,
		"specific_use": 123,
		"proposed_action": 123,
		"seed_stage": 123,
		"plant_health": 123,
		"plant_life_stage": 123,
		"early_detection": 1,
		"research": true,
		"well_on_site_ind": true,
		"special_care_ind": true,
		"biological_care_ind": true,
		"legacy_site_ind": true,
		"range_unit": "Canyon"
	}
}
'
