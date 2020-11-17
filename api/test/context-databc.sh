# Request private land
curl -X GET "localhost:3002/api/context/databc/WHSE_CADASTRE.CBM_CADASTRAL_FABRIC_PUB_SVW?lon=-125.05596&lat=49.28648" \
--header "Content-Type: application/json" \
--header 'Authorization: Bearer '${1}
