import { FormValidation } from '@rjsf/utils';
import { rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { InvasivesFormData } from 'rjsf/business-rules/custom-validation/form-data';

/*
  function to validate frep form a BAF, fixed_area and full_count_area fields
 */
function getPlotIdentificationTreesValidator(_activitySubtype: string): rjsfValidator {
  return ((
    formData: InvasivesFormData & {
      activity_subtype_data: {
        form_b?: {
          form_a: {
            plot_identification_trees: {
              trees_exist: string;
              baf: unknown;
              fixed_area: boolean;
              full_count_area: boolean;
            };
          }[];
        }[];
      };
    },
    errors: FormValidation<{
      activity_subtype_data: {
        form_b: {
          form_a: {
            plot_identification_trees: {
              trees_exist: string;
              fixed_area: boolean;
              full_count_area: boolean;
            };
          }[];
        }[];
      };
    }>
  ): FormValidation => {
    if (!formData || !formData.activity_subtype_data) {
      return errors as FormValidation;
    }
    let form_b_index = 0;
    // For each form b
    if (formData.activity_subtype_data.form_b) {
      formData.activity_subtype_data.form_b?.forEach((formB) => {
        // For each form a
        let form_a_index = 0;
        if (formB.form_a) {
          formB.form_a.forEach((formA) => {
            // Check if plot identification trees section is valid
            if (formA.plot_identification_trees) {
              const form = formA.plot_identification_trees;

              // TypeScript can't directly infer types without an intermediate const here
              const relatedError =
                errors.activity_subtype_data?.form_b?.[form_b_index]?.form_a?.[form_a_index]?.plot_identification_trees;

              if (relatedError) {
                relatedError.__errors = [];
              }
              if (form.trees_exist === 'Yes' && !form.baf && !form.fixed_area && !form.full_count_area) {
                errors.activity_subtype_data?.form_b?.[form_b_index]?.form_a?.[
                  form_a_index
                ]?.plot_identification_trees?.addError(
                  'Please fill out at least one of BAF, Fixed Area Radius (m) or Full Count Area (ha).'
                );
              }
            }
            form_a_index++;
          });
        }
        form_b_index++;
      });
    }
    return errors as FormValidation;
  }) as unknown as rjsfValidator;
}

export { getPlotIdentificationTreesValidator };
