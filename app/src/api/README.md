# Updating api-schema.ts

If making changes locally, you can manually update the api-schema with the following commands.

```sh
# Run these from the `api-rework/invasives` folder.
python3 manage.py export_openapi_schema  --indent 2  --api api.urls.ninja_api --output schema.json
npx openapi-typescript schema.json --output ../../app/src/api/api-schema.ts --root-types --root-types-no-schema-prefix
```
