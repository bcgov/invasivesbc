# TODO: Assign DB environment variables
curl -X PUT -d @./observation-point.json "localhost:3002/api/activity" \
--header "Content-Type: application/json" \
--header 'Authorization: Bearer '${1} \
