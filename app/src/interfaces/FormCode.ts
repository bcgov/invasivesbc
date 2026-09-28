interface FormCode {
  full_name: string;
  code: string | boolean;
  code_sort_order?: number;
  table?: string;
  valid_to?: string | null;
}

export default FormCode;
