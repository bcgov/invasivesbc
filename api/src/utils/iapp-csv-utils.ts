import { format } from 'date-fns';

export const mapSitesRowsToCSV = async (response: any, templateName: string) => {
  const headers = response.fields.map((fieldObj) => fieldObj?.name).join(',') + '\n';

  // set up callbacks to format specific fields
  const fieldFormatMap = {};
  const defaultFormatter = (value) => {
    return typeof value === 'string' ? '"' + value + '"' : value;
  };
  switch (templateName) {
    default:
      fieldFormatMap['site_created_date'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['survey_date'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['treatment_date'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['monitoring_date'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['collection_date'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['last_surveyed_date'] = (value) => {
        const date = format(value, 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['activity_date_time'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd HH:mm:ss');
        return date;
      };
      fieldFormatMap['created_timestamp'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd HH:mm:ss');
        return date;
      };
      fieldFormatMap['updated_timestamp'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd HH:mm:ss');
        return date;
      };
      fieldFormatMap['date_entered'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['date_updated'] = (value) => {
        if (value === null) return '';
        const date = format(value, 'yyyy-MM-dd');
        return date;
      };
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
  }
  const rows = response.rows.map((row) => {
    return Object.keys(row)
      .map((fieldNameRaw: any) => {
        try {
          const fieldName = fieldNameRaw.trim();
          const formatter =
            typeof fieldFormatMap[fieldName] === 'function' ? fieldFormatMap[fieldName] : defaultFormatter;
          const unformatted =
            typeof row[fieldName] === 'string' ? row[fieldName].replace(/(\r\n|\n|\r)/gm, '') : row[fieldName];
          const formatted = formatter(unformatted);
          return formatted;
        } catch (e) {
          return null;
        }
      })
      .join(',');
  });
  const csv = headers + rows.join('\n');
  return csv;
};
