import AWS from 'aws-sdk';
import { Client } from 'pg';
import fs from 'fs';
import { getLogger } from 'utils/logger';
import { getDBConnection } from 'database/db';
import { PassThrough } from 'stream';

const defaultLog = getLogger('observation-activity-dump');

// const S3 = new AWS.S3({
// ...
// });

// This script currently downloads a CSV file locally. It needs to be updated to
// upload the CSV file to a designated location, assuming it's an S3 bucket
async function fetchAndStreamDataToCSV() {
  const connection = await getDBConnection();

  const csvStream = fs.createWriteStream('observation_records.csv', { flags: 'w' });
  // const passThrough = new PassThrough();

  // set up S3 upload stream
  // const s3Upload = s3.upload({
  //   Bucket: 'bucket-name',
  //   Key: 'path/to/observation_records.csv',
  //   Body: passThrough,
  //   ContentType: 'text/csv'
  // });

  // track if upload is complete
  // s3Upload
  //   .promise()
  //   .then(() => {
  //     console.log('Upload is complete!');
  //   })
  //   .catch(console.error);

  let offset = 0;
  let hasMoreData = true;
  let batchSize = 200;
  let columnNames: string[] | null = null;

  while (hasMoreData) {
    const res = await connection.query(getQuery(), [batchSize, offset]);

    if (res.rows.length > 0) {
      if (!columnNames) {
        columnNames = Object.keys(res.rows[0]);
        csvStream.write(columnNames.join(',') + '\n');
        //passThrough.write(columnNames.join(',') + '\n');
      }

      for (const row of res.rows) {
        const rowData = columnNames.map((col) => {
          const val = row[col];

          if (val === null || val === undefined) return '';
          const strVal = String(val).replace(/"/g, '""');
          return /[,"\n]/.test(strVal) ? `"${strVal}"` : strVal;
        });

        csvStream.write(rowData.join(',') + '\n');
        // passThrough.write(rowData.join(',') + '\n');
      }

      offset += batchSize;
      await wait(200); // wait 200ms before next query
    } else {
      hasMoreData = false;
    }
  }
  csvStream.end();
  // passThrough.end();

  await connection.release();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)); // might not be needed for s3 upload

const getQuery = () => `
    select
    a.short_id as Short_ID,
    a.activity_type as Activity_Type,
    m.full_subtype as Activity_Subtype,
    to_date(a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD') Activity_Date,
    a.activity_payload #>> '{form_data, activity_data, latitude}' as Latitude,
    a.activity_payload #>> '{form_data, activity_data, longitude}' as Longitude,
    a.invasive_plant as Invasive_Plant,
    string_agg(species_negative_code.species, ', ') as Species_Negative,
    string_agg(species_positive_code.species, ', ') as Species_Positive,
    (a.activity_payload #> '{form_data,activity_data,reported_area}')::numeric as Area,
    a.species_negative_full as Species_Negative_Full,
    a.species_positive_full as Species_Positive_Full,
    a.map_symbol as label,
    case when st_geometrytype(a.geog::geometry) = 'ST_Point' then ST_AsText(st_transform(st_buffer(a.geog, (activity_payload #> '{geometry,0,properties,radius}')::numeric, 'quad_segs=30')::geometry, 3005))
         else ST_AsText(st_transform(a.geog::geometry, 3005))
         end as geometry
    from
        invasivesbc.activity_incoming_data a
    left join invasivesbc.activity_subtype_mapping m on m.form_subtype = a.activity_subtype    
    left join lateral (
        select jsonb_array_elements_text(a.species_positive) as species
        where jsonb_typeof(a.species_positive) = 'array'
        order by species
    ) as species_positive_code on true
    left join lateral (
        select jsonb_array_elements_text(a.species_negative) as species
        where jsonb_typeof(a.species_negative) = 'array'
        order by species
    ) as species_negative_code on true
    where
        a.iscurrent
        and a.form_status = 'Submitted'
        and a.activity_type = 'Observation'

    group by a.short_id,
            a.activity_type,
            m.full_subtype,
            a.invasive_plant,
            a.activity_payload,
            a.species_negative_full,
            a.species_positive_full,
            a.map_symbol,
            a.geog
    LIMIT $1 OFFSET $2;
    `;

fetchAndStreamDataToCSV().then(() => {
  defaultLog.info({ message: 'shutting down' });
});
