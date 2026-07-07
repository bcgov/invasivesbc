import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import AlertMessage from 'interfaces/AlertMessage';

type PydanticError = {
  type: string;
  loc: Array<string>;
  ctx?: object;
  msg: string;
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * @desc Parser for Pydantic validation errors.
 * @returns {string} formatted error message
 */
const formatMessage = (msg: string, type: string) => {
  const required = 'Field is required';
  if (msg === 'Value error, Invalid type for code: None') {
    return 'Should be valid option from dropdown.';
  }
  const typeMap = {
    too_short: msg,
    string_too_short: msg,
    greater_than: msg,
    enum: msg,
    value_error: msg,
    string_type: required,
    missing: required
  };
  return typeMap?.[type] ?? msg;
};

const transformPydanticErrors = (rawErrors: Array<PydanticError>): Array<AlertMessage> =>
  rawErrors.map(({ type, loc, msg }) => {
    /* 
    If the error is on an array itself, we'll get a meaningless index, so if that's the case, iterate to the next one
    e.g.: ["subtype_data", "entries", 0]
    */
    const field: string = (() => {
      for (const entry of loc.reverse()) {
        if (typeof entry === 'string') {
          return capitalize(entry.replaceAll('_', ' '));
        }
      }
      return loc[0];
    })();

    return {
      content: `[${field}]: ${formatMessage(msg, type)}`,
      severity: AlertSeverity.Error,
      subject: AlertSubjects.Form,
      autoClose: 5
    };
  });

export default transformPydanticErrors;
