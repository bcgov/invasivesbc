# Request activity by ID
curl -X GET "localhost:3002/api/activity/01efdd76-56fb-44b5-b7dc-6c50587d00ef" \
--header "Content-Type: application/json" \
--header 'Authorization: Bearer '${1}
