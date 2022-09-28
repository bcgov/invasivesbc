import { getFieldsToCopy } from 'rjsf/business-rules/formDataCopyFields';

/*
  Function that takes in formData to save and the activitySubtype
  and stores both into session storage for pasting ability later
*/
export function saveFormDataToSession(formData: any, activitySubtype: string): void {
  /*const activityData = { ...formData.activity_data };
  const activitySubtypeData = { ...formData.activity_subtype_data };

  // call business rule function to exclude certain fields of the activity_data of the form data
  const activityDataToCopy = getFieldsToCopy(activityData, activitySubtypeData).activityData;

  const formDataToCopy = {
    ...formData,
    activity_data: activityDataToCopy
  };
  */

  sessionStorage.setItem('copiedFormData', JSON.stringify(formData));
  sessionStorage.setItem('copiedSubType', activitySubtype);
}

/*
  Function to get the saved form data from session storage
  and return it after ensuring the activity_data is not completely overriden
  (due to business rule)
*/
export function retrieveFormDataFromSession(): any {
  const newActivityData = { ...JSON.parse(sessionStorage.getItem('copiedFormData')) };

  return {
    ...newActivityData
  };
}
