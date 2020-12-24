import { getFieldsToCopy } from 'rjsf/business-rules/formDataCopyFields';

/*
  Function that takes in formData to save and the activitySubtype
  and stores both into session storage for pasting ability later
*/
export function saveFormDataToSession(formData: any, activitySubtype: string): void {
  const activityData = { ...formData.activity_data };

  // call business rule function to exclude certain fields of the activity_data of the form data
  const activityDataToCopy = getFieldsToCopy(activityData);

  const formDataToCopy = {
    ...formData,
    activity_data: activityDataToCopy
  };

  sessionStorage.setItem('copiedFormData', JSON.stringify(formDataToCopy));
  sessionStorage.setItem('activitySubtype', activitySubtype);
}

/*
  Function to get the saved form data from session storage
  and return it after ensuring the activity_data is not completely overriden
  (due to business rule)
*/
export function retrieveFormDataFromSession(activity: any): any {
  const formData = activity.formData;
  const activityData = { ...formData.activity_data };
  const newActivityData = { ...activityData, ...JSON.parse(sessionStorage.getItem('copiedFormData')).activity_data };

  return {
    ...JSON.parse(sessionStorage.getItem('copiedFormData')),
    activity_data: newActivityData
  };
}
