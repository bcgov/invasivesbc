# API type-safety

Eventually, these should be integrated as part of the build process, and not committed to the repository.

## To generate

### Step 1 - Django export
`python3 manage.py export_openapi_schema --api api.urls.ninja_api --indent 2 > schema.json`

### Step 2 - Type export
`npx openapi-typescript schema.json --output api.ts --root-types --root-types-no-schema-prefix`

You can then use the exported types in other client-side code
