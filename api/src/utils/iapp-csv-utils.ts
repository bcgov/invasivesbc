import { format, parseISO } from 'date-fns';

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
        if (value === null) {
            return '';
        }
        const justDate = typeof value === 'string'? value : value.toISOString()
        const date = format(parseISO(justDate), 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['survey_date'] = (value) => {
        if (value === null) {
            return '';
        }
        const justDate = typeof value === 'string'? value : value.toISOString()
        const date = format(parseISO(justDate), 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['treatment_date'] = (value) => {
        if (value === null) {
            return '';
        }
        const justDate = typeof value === 'string'? value : value.toISOString()
        const date = format(parseISO(justDate), 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['monitoring_date'] = (value) => {
        if (value === null) {
            return '';
        }
        const justDate = typeof value === 'string'? value : value.toISOString()
        const date = format(parseISO(justDate), 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['collection_date'] = (value) => {
        if (value === null) {
            return '';
        }
        const justDate = typeof value === 'string'? value : value.toISOString()
        const date = format(parseISO(justDate), 'yyyy-MM-dd');
        return date;
      }
      fieldFormatMap['inspection_date'] = (value) => {
        if (value === null) {
            return '';
        }
        const justDate = typeof value === 'string'? value : value.toISOString()
        const date = format(parseISO(justDate), 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['last_surveyed_date'] = (value) => {
        if (value === null) {
            return '';
        }
        const justDate = typeof value === 'string'? value : value.toISOString()
        const date = format(parseISO(justDate), 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['activity_date_time'] = (value) => {
        if (value === null) return '';
        const date = format(parseISO(value), 'yyyy-MM-dd HH:mm:ss');
        return date;
      };
      fieldFormatMap['created_timestamp'] = (value) => {
        if (value === null) return '';
        const date = format(parseISO(value), 'yyyy-MM-dd HH:mm:ss');
        return date;
      };
      fieldFormatMap['updated_timestamp'] = (value) => {
        if (value === null) return '';
        const date = format(parseISO(value), 'yyyy-MM-dd HH:mm:ss');
        return date;
      };
      fieldFormatMap['date_entered'] = (value) => {
        if (value === null) return '';
        const date = format(parseISO(value), 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['date_updated'] = (value) => {
        if (value === null) return '';
        const date = format(parseISO(value), 'yyyy-MM-dd');
        return date;
      };
      fieldFormatMap['jurisdictions'] = (value) => {
        return '"' + value + '"';
      };
      fieldFormatMap['comment'] = (value) => {
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['comments'] = (value) => {
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['site_comments'] = (value) => {
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['site_location'] = (value) => {
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['bioagent_source'] = (value) => {
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['survey_comments'] = (value) => {
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['treatment_comments'] = (value) => {
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['monitoring_comments'] = (value) => {
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['jurisdiction'] = (value) => {
        return '"' + value + '"';
      };
      fieldFormatMap['other_surveyors'] = (value) => {
        return '"' + value + '"';
      };
      fieldFormatMap['other_applicators'] = (value) => {
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
