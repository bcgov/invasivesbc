import { FormValidation } from '@rjsf/utils';
import { lookupAreaLimit } from 'sharedAPI';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

type FormDataWithReportedArea = InvasivesFormData & {
  activity_data: {
    reported_area: number;
  };
};

function IsFormDataWithReportedArea(formData: InvasivesFormData): formData is FormDataWithReportedArea {
  return formData.activity_data.reported_area !== undefined;
}

/*
  Function to validate that the net geo area selected does not exceed the limits
  specified by business area for various activity types
*/
function getAreaValidator(activitySubtype: string): rjsfValidator {
  return (
    formData: InvasivesFormData,
    errors: FormValidation<{
      activity_data: { reported_area: number };
    }>
  ): FormValidation => {
    const areaLimit = lookupAreaLimit(activitySubtype);

    if (!IsFormDataWithReportedArea(formData)) {
      return errors as FormValidation;
    }

    // validate reported area limit
    if (errors.activity_data?.reported_area) {
      errors.activity_data.reported_area.__errors = [];
      if (formData.activity_data.reported_area > areaLimit) {
        errors.activity_data['reported_area'].addError(`Area cannot exceed ${areaLimit} m\u00B2`);
      }
    }

    return errors as FormValidation;
  };
}

export { getAreaValidator };
