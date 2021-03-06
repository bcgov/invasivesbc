# API Testing with Postman (POC)

This is the Postman Setup for testing for testing the Mobile API. Its primary goal is to run against oour PR and Dev code.

How to run the PostMan Tests:
- [Get Postman](https://www.postman.com/downloads/)
- Import `invasives_api_dev.postman_collection.json` and `invasives_api_dev.environment.json`
- Change the following settings in Postman environment DEV:

```json
{
	"key": "POSTMAN_PASSWORD",
	"value": "<Change to openshift postman pwd>",
	"enabled": true
}
```

**POSTMAN_PASSWORD** is the password for our test user *postman*

## Running Tests

- Tests can be run within the Postman application either one by one or with the *Runner* option, which allows for the complete suite to run.
- Tests can also run from the command line (and therefore the CI) with [Newman](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)

## License

    Copyright 2020 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
