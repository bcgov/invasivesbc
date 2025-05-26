import { FormValidation } from '@rjsf/utils';

type InvasivesFormData = {
  /* include the basic fields in this representation for type-safety in the validators */
  activity_data: Record<string, unknown> & {
    activity_date_time: string;
    jurisdictions: {
      percent_covered: number;
      jurisdiction_code: string;
    }[];
  };
  activity_subtype_data: Record<string, unknown>;
  forceNoValidationFields?: string[];
};

abstract class TypeDependentInvasivesFormValidator<T extends InvasivesFormData, E> {
  validate(formData: T, errors: FormValidation<E>): FormValidation<E> {
    return errors;
  }
}

export type { InvasivesFormData };

export { TypeDependentInvasivesFormValidator };
