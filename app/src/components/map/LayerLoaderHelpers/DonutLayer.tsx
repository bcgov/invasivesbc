import React from 'react';
import Donut from '../Donut';

const myObj = {
  rows: [
    {
      geojson: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-122.798266, 53.874819],
              [-122.798266, 53.875148],
              [-122.797709, 53.875148],
              [-122.797709, 53.874819],
              [-122.798266, 53.874819]
            ]
          ]
        },
        properties: {
          id: 'c9bbff63-2fab-42b9-8676-5642975f03db',
          bec: null,
          own: null,
          elev: null,
          ipma: 'IPMA 6 - Prince George',
          riso: 'Northwest Invasive Plant Council',
          type: 'Observation',
          created: '2022-07-12T14:57:17',
          subtype: 'Activity_Observation_PlantTerrestrial',
          motiDist: null,
          wellProx: null,
          flnroDist: null,
          jurisdiction: null,
          regionalDist: null,
          species_negative: null,
          species_positive: ['AR']
        }
      },
      total_rows_count: '3'
    },
    {
      geojson: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.78492, 53.919073]
        },
        properties: {
          id: '7b9de228-3dc7-4390-a67c-5a478691d6aa',
          bec: null,
          own: null,
          elev: 605,
          ipma: 'IPMA 6 - Prince George',
          riso: 'Northwest Invasive Plant Council',
          type: 'Observation',
          created: '2022-07-12T15:38:45',
          subtype: 'Activity_Observation_PlantTerrestrial',
          motiDist: null,
          wellProx: 466,
          flnroDist: null,
          jurisdiction: null,
          regionalDist: null,
          species_negative: null,
          species_positive: ['AS']
        }
      },
      total_rows_count: '3'
    },
    {
      geojson: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-122.809607, 53.90804],
              [-122.809446, 53.907945],
              [-122.809639, 53.907907],
              [-122.810369, 53.907989],
              [-122.810637, 53.908071],
              [-122.810411, 53.90828],
              [-122.81009, 53.908413],
              [-122.809843, 53.908469],
              [-122.809607, 53.90804]
            ]
          ]
        },
        properties: {
          id: '9a0a14dd-b115-4406-b8e6-b5c7ac9739e1',
          bec: 'SBS dw 3',
          own: 'Municipal',
          elev: 605,
          ipma: 'IPMA 6 - Prince George',
          riso: 'Northwest Invasive Plant Council',
          type: 'Treatment',
          created: '2022-07-13T09:16:56',
          subtype: 'Activity_Treatment_MechanicalPlantTerrestrial',
          motiDist: 'Fort George',
          wellProx: null,
          flnroDist: 'Prince George Natural Resource District',
          jurisdiction: null,
          regionalDist: 'Peace River Regional District',
          species_negative: null,
          species_positive: null
        }
      },
      total_rows_count: '3'
    }
  ]
};

const mapActivities = () => {
  const data = [];
  myObj.rows.forEach((obj) => {
    if (data.length === 0) {
      data.push({ name: obj.geojson.properties.type, count: 1 });
    } else {
      let flag = 0;
      for (let row of data) {
        if (obj.geojson.properties.type === row.name) {
          flag = 1;
          row.count += 1;
          break;
        }
      }
      if (flag === 0) {
        data.push({ name: obj.geojson.properties.type, count: 1 });
      }
    }
  });
  return data;
};

export const DonutLayer = () => {
  const center = [53.908011, -122.808612];
  const data = mapActivities();
  console.log('================', data);

  return (
    <>
      <Donut
        center={[52.1718463, -121.6168777]}
        data={[
          { name: 'Sample A', count: 12, fillColour: 'red' },
          { name: 'Sample B', count: 3, fillColour: 'black' },
          { name: 'Sample C', count: 92, fillColour: '#20e490' }
        ]}
      />
      <Donut center={center} data={data} />;
    </>
  );
};
