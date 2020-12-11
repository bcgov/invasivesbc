# Request closest well
curl -X GET "localhost:3002/api/context/well?lon=-123.970665&lat=53.999860" \
--header "Content-Type: application/json" \
--header 'Authorization: Bearer '${1}
