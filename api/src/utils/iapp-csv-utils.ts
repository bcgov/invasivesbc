export const mapSitesRowsToCSV = async (response: any, templateName: string) => {
  const headers = response.fields.map((fieldObj) => fieldObj.name).join(',') + '\n';

  // set up callbacks to format specific fields
  let fieldFormatMap = {};
  const defaultFormatter = (value) => {return value}; 
  switch (templateName) {
    default:
      fieldFormatMap['jurisdictions'] = (value) => {
        return '"' + value + '"';
      };
    case 'planning_extract':
      fieldFormatMap['fieldOne'] = (value) => {
        return value;
      };
      fieldFormatMap['fieldTwo'] = (value) => {
        return value + 'banana';
      };
      break;
    case 'default_activities_extract':
      fieldFormatMap['fieldOne'] = (value) => {
        return value;
      };
      break;
  }


  const rows = response.rows.map((row, i) => {
    return Object.keys(row)
      .map((fieldNameRaw: any) => {
        const fieldName = fieldNameRaw.trim()
        const formatter = typeof fieldFormatMap[fieldName] === 'function'? fieldFormatMap[fieldName]: defaultFormatter 
        let unformatted =
          typeof row[fieldName] === 'string' ? row[fieldName].replace(/(\r\n|\n|\r)/gm, '') : row[fieldName];
        const formatted = formatter(unformatted);
        return formatted;
      })
      .join(',');
  });
  const csv = headers + rows.join('\n');
  return csv;
};
