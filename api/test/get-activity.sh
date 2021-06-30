# Request activity by ID
# curl -X GET "localhost:3002/api/activity/01efdd76-56fb-44b5-b7dc-6c50587d00ef" \
# --header "Content-Type: application/json" \
# --header 'Authorization: Bearer '${1}

curl -X GET "localhost:3002/api/activity/d3d3a89c-4e11-4dd2-848e-aea53c32b672" \
--header "Content-Type: application/json" \
--header 'Authorization: Bearer '${1}
