import { format } from 'date-fns';

export const mapSitesRowsToCSV = async (response: any, templateName: string) => {
  const headers = response.fields.map((fieldObj) => fieldObj.name).join(',') + '\n';

  // set up callbacks to format specific fields
  const fieldFormatMap = {};
  const defaultFormatter = (value) => {
    return typeof value === 'string' ? '"' + value + '"' : value;
  };
  switch (templateName) {
    default:
      fieldFormatMap['jurisdictions'] = (value) => {
        return '"' + value + '"';
      };
      fieldFormatMap['comment'] = (value) => {
        return '"' + value + '"';
      };
      fieldFormatMap['comments'] = (value) => {
        return '"' + value + '"';
      };
      fieldFormatMap['jurisdiction'] = (value) => {
        return '"' + value + '"';
      };
      break;
    case 'site_selection_extract':
      fieldFormatMap['fieldOne'] = (value) => {
        return value;
      };
      fieldFormatMap['fieldTwo'] = (value) => {
        return value + 'banana';
      };
      fieldFormatMap['site_created_date'] = (value) => {
        const date = format(value, 'yyyy-MM-dd HH:mm:ss');
        return date;
      };
      break;
    case 'terrestrial_plant_observation':
      fieldFormatMap['fieldOne'] = (value) => {
        return value;
      };
      break;
    case 'aquatic_plant_observation':
      fieldFormatMap['fieldOne'] = (value) => {
        return value;
      };
      break;
  }

  const rows = response.rows.map((row, i) => {
    return Object.keys(row)
      .map((fieldNameRaw: any) => {
        const fieldName = fieldNameRaw.trim();
        const formatter =
          typeof fieldFormatMap[fieldName] === 'function' ? fieldFormatMap[fieldName] : defaultFormatter;
        const unformatted =
          typeof row[fieldName] === 'string' ? row[fieldName].replace(/(\r\n|\n|\r)/gm, '') : row[fieldName];
        const formatted = formatter(unformatted);
        return formatted;
      })
      .join(',');
  });
  const csv = headers + rows.join('\n');
  return csv;
};
