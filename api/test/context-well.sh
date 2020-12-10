# Request closest well
curl -X GET "localhost:3002/api/context/well?lon=-125.05596&lat=49.28648" \
--header "Content-Type: application/json" \
--header 'Authorization: Bearer '${1}
