/*
 * Copyright © 2019 Province of British Columbia
 * Licensed under the Apache License, Version 2.0 (the "License")
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * **
 * http://www.apache.org/licenses/LICENSE-2.0
 * **
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * File: checkAndClean.js
 * Project: pipeline
 * File Created: Tuesday, 29th October 2019 10:17:44 am
 * Author: pushan (you@you.you)
 * -----
 * Last Modified: Tuesday, 29th October 2019 10:18:04 am
 * Modified By: pushan (you@you.you>)
 * -----
 */
/**
 * @description Check and delete existing resource
 */
module.exports = (resourceName, oc) => {
  try {
    const list = oc.get(resourceName) || [];
    if (list.length === 0) {
      console.log(`checkAndClean: No resource available with resource name: ${resourceName}`);
    } else {
      console.log(`checkAndClean: Cleaning resource => ${resourceName}`);
      oc.delete([resourceName], { 'ignore-not-found': 'true', wait: 'true' });
    }
  } catch (excp) {
    console.log(`Resource ${resourceName} not available [${excp}]`);
  }
};
// ---------------------------------------
