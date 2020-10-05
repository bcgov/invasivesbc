# TODO replace `{1}` with a valid JWT token string

# local dev: localhost:3002/api/activity
# local dev using docker: localhost/api/activity

curl -X POST \
  -d @activity-with-files.json \
  'localhost/api/activity/' \
  --header "Content-Type: application/json" \
  --header 'Authorization: Bearer {1}' \
