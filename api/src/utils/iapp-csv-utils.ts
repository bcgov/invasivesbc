export const mapSitesRowsToCSV = async (response: any, templateName: string) => {
  const headers = response.fields.map((fieldObj) => fieldObj.name).join(',') + '\n';

  // set up callbacks to format specific fields
  let fieldFormatMap = {};
  switch (templateName) {
    case 'main_extract':
      fieldFormatMap['fieldOne'] = (value) => {
        return value;
      };
      fieldFormatMap['fieldTwo'] = (value) => {
        return value + 'banana';
      };
      fieldFormatMap['jurisdictions'] = (value) => {
        return '"' + value + '"';
      };
      break;
    default:
      break;
  }


  const rows = response.rows.map((row, i) => {
    return Object.keys(row)
      .map((fieldNameRaw: any) => {
        const fieldName = fieldNameRaw.trim()
        const formatter = typeof fieldFormatMap[fieldName] === 'function'? fieldFormatMap[fieldName]: (value) => {return value};
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
