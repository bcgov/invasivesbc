import { format, parseISO } from 'date-fns';

// tunable -- how many rows to request/stream at a time. lower = more round trips to DB, but less node memory use.
const CURSOR_PAGE_SIZE = 100;

export async function* generateSitesCSV(cursor: any, templateName: string) {
  let page = await cursor.read(1);
  // this is a private field on cursor but there's no better way to get the metadata.
  // need to have read() at least once for it to be present.
  yield cursor._result.fields.map((fieldObj) => fieldObj?.name).join(',') + '\n';

  // set up callbacks to format specific fields
  const fieldFormatMap = {};
  const defaultFormatter = (value) => {
    if (value === null || value === undefined || value === '') {
      return '';
    } else {
      return typeof value === 'string' ? '"' + value + '"' : value;
    }
  };

  switch (templateName) {
    default:
      fieldFormatMap['site_created_date'] = (value) => {
        if (value === null) {
          return '';
        }
        const justDate = typeof value === 'string' ? value : value.toISOString();
        return format(parseISO(justDate), 'yyyy-MM-dd');
      };
      fieldFormatMap['survey_date'] = (value) => {
        if (value === null) {
          return '';
        }
        const justDate = typeof value === 'string' ? value : value.toISOString();
        return format(parseISO(justDate), 'yyyy-MM-dd');
      };
      fieldFormatMap['treatment_date'] = (value) => {
        if (value === null) {
          return '';
        }
        const justDate = typeof value === 'string' ? value : value.toISOString();
        return format(parseISO(justDate), 'yyyy-MM-dd');
      };
      fieldFormatMap['monitoring_date'] = (value) => {
        if (value === null) {
          return '';
        }
        const justDate = typeof value === 'string' ? value : value.toISOString();
        return format(parseISO(justDate), 'yyyy-MM-dd');
      };
      fieldFormatMap['collection_date'] = (value) => {
        if (value === null) {
          return '';
        }
        const justDate = typeof value === 'string' ? value : value.toISOString();
        return format(parseISO(justDate), 'yyyy-MM-dd');
      };
      fieldFormatMap['inspection_date'] = (value) => {
        if (value === null) {
          return '';
        }
        const justDate = typeof value === 'string' ? value : value.toISOString();
        return format(parseISO(justDate), 'yyyy-MM-dd');
      };
      fieldFormatMap['last_surveyed_date'] = (value) => {
        if (value === null) {
          return '';
        }
        const justDate = typeof value === 'string' ? value : value.toISOString();
        return format(parseISO(justDate), 'yyyy-MM-dd');
      };
      fieldFormatMap['updated_timestamp'] = (value) => {
        if (value === null) return '';
        return format(parseISO(value), 'yyyy-MM-dd HH:mm:ss');
      };
      fieldFormatMap['date_entered'] = (value) => {
        if (value === null) return '';
        return format(parseISO(value), 'yyyy-MM-dd');
      };
      fieldFormatMap['date_updated'] = (value) => {
        if (value === null) return '';
        return format(parseISO(value), 'yyyy-MM-dd');
      };
      fieldFormatMap['activity_date_time'] = (value) => {
        if (value === null) return '';
        const formattedDate = format(value, 'yyyy-MM-dd');
        return formattedDate;
      };
      fieldFormatMap['created_timestamp'] = (value) => {
        if (value === null) return '';
        const formattedDate = format(value, 'yyyy-MM-dd');
        return formattedDate;
      };
      fieldFormatMap['received_timestamp'] = (value) => {
        if (value === null) return '';
        const formattedDate = format(value, 'yyyy-MM-dd');
        return formattedDate;
      };

      fieldFormatMap['jurisdictions'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value + '"';
      };
      fieldFormatMap['comment'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['comments'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['site_comments'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['site_location'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['bioagent_source'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['survey_comments'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['treatment_comments'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['monitoring_comments'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['location_description'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['access_description'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value.replace(/\"/g, '') + '"';
      };
      fieldFormatMap['jurisdiction'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value + '"';
      };
      fieldFormatMap['other_surveyors'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value + '"';
      };
      fieldFormatMap['other_applicators'] = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return '"' + value + '"';
      };
      break;
  }
  do {
    for (const row of page) {
      yield Object.keys(row)
        .map((fieldNameRaw: any) => {
          try {
            const fieldName = fieldNameRaw.trim();
            const formatter =
              typeof fieldFormatMap[fieldName] === 'function' ? fieldFormatMap[fieldName] : defaultFormatter;
            const unformatted =
              typeof row[fieldName] === 'string' ? row[fieldName].replace(/(\r\n|\n|\r)/gm, '') : row[fieldName];
            return formatter(unformatted);
          } catch (e) {
            return 'ERROR';
          }
        })
        .join(',');
      yield '\n';
    }
    page = await cursor.read(CURSOR_PAGE_SIZE);
  } while (page.length > 0);
}
