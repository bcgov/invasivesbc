import Knex from 'knex';
import * as turf from '@turf/turf';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

/**
 * Create the `application_user` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */

const env: string = process.env.REACT_APP_REAL_NODE_ENV;
let bcGeo;
if (env.match(/dev/i) || env.match(/local/i)) {
  //VANCOUVER ISLAND
  bcGeo = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-128.485107421875, 50.7295015014743],
              [-128.177490234375, 49.89463439573421],
              [-123.914794921875, 48.268569112964336],
              [-123.167724609375, 48.39273786659243],
              [-123.48632812499999, 49.26780455063753],
              [-125.628662109375, 50.45750402042058],
              [-127.935791015625, 51.04139389812637],
              [-128.485107421875, 50.7295015014743]
            ]
          ]
        }
      }
    ]
  };
} else {
  //ENTIRE PROVINCE
  bcGeo = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-139.5703125, 60.56537850464181],
              [-134.560546875, 53.72271667491848],
              [-125.859375, 47.635783590864854],
              [-113.6865234375, 48.31242790407178],
              [-113.291015625, 49.781264058178344],
              [-119.2236328125, 53.904338156274704],
              [-119.44335937499999, 60.34869562531862],
              [-139.5703125, 60.56537850464181]
            ]
          ]
        }
      }
    ]
  };
}

export const createSmallerGrid = (feature, factor) => {
  const topLeftCoords = feature.geometry.coordinates[0][1];
  const topRightCoords = feature.geometry.coordinates[0][2];
  const bottomRightCoords = feature.geometry.coordinates[0][3];

  const verLength = (topRightCoords[0] - topLeftCoords[0]) / factor;
  const horLength = (bottomRightCoords[1] - topRightCoords[1]) / factor;

  const polyArr = [];
  for (let i = 0; i < factor; i++) {
    const leftSide = topLeftCoords[0] + verLength * i;
    const rightSide = topLeftCoords[0] + verLength * i + verLength;

    const poly1 = [
      [
        [leftSide, topLeftCoords[1] + horLength],
        [leftSide, topLeftCoords[1]],
        [rightSide, topLeftCoords[1]],
        [rightSide, topLeftCoords[1] + horLength],
        [leftSide, topLeftCoords[1] + horLength]
      ]
    ];

    for (let i = 0; i < factor; i++) {
      const topSide = topLeftCoords[1] + horLength * i;
      const bottomSide = topLeftCoords[1] + horLength * i + horLength;
      const poly2 = [
        [
          [leftSide, bottomSide],
          [leftSide, topSide],
          [rightSide, topSide],
          [rightSide, bottomSide],
          [leftSide, bottomSide]
        ]
      ];
      const polyAct2 = turf.polygon(poly2);
      polyArr.push(polyAct2);
    }
    const polyAct = turf.polygon(poly1);
    polyArr.push(polyAct);
  }
  return polyArr;
};

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    create table if not exists ${DB_SCHEMA}.bc_large_grid (
        id integer NOT NULL,
        geo geography(Geometry) not null,
        PRIMARY KEY (id)
    );

    create table if not exists ${DB_SCHEMA}.bc_small_grid (
        id serial,
        geo geography(Geometry) not null,
        large_grid_item_id integer not null
    );
  `;

    await knex.raw(sql);

    const bbox = turf.bbox(bcGeo);
    const largeGrid = turf.squareGrid(bbox, 20);

    const BCLargeGrid = largeGrid.features.filter((feature) => {
      return (
        turf.booleanOverlap(bcGeo.features[0].geometry, feature) ||
        turf.booleanWithin(feature, bcGeo.features[0].geometry)
      );
    });
    let largeGridItemIndex = 0;

    for (const largeGridItem of BCLargeGrid) {
      const sqlInsert = `INSERT INTO ${DB_SCHEMA}.bc_large_grid VALUES(${largeGridItemIndex}, 
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(public.ST_GeomFromGeoJSON('${JSON.stringify(largeGridItem.geometry)}'),4326)
          )
        )
      );`;
      await knex.raw(sqlInsert);
      const smallGrid = createSmallerGrid(largeGridItem, 40);
      let smallGridItemIndex = 0;
      let sqlInsertSm = `INSERT INTO ${DB_SCHEMA}.bc_small_grid (geo,large_grid_item_id) VALUES`;
      const gridLength = smallGrid.length;
      for (const smGridItem of smallGrid) {
        const valuesString =
          smallGridItemIndex !== gridLength - 1
            ? `(
                  public.geography(
                    public.ST_Force2D(
                      public.ST_SetSRID(public.ST_GeomFromGeoJSON('${JSON.stringify(smGridItem.geometry)}'),4326)
                    )
                ), ${largeGridItemIndex}),`
            : `(public.geography(
                  public.ST_Force2D(
                    public.ST_SetSRID(
                      public.ST_GeomFromGeoJSON('${JSON.stringify(smGridItem.geometry)}'),
                      4326
                      )
                    )
                  ), ${largeGridItemIndex});`;
        sqlInsertSm += valuesString;

        smallGridItemIndex++;
      }
      await knex.raw(sqlInsertSm);

      largeGridItemIndex++;
    }
  } catch (e) {
    console.log('****Error: ' + e);
  }
}

/**
 * Drop the `application_user` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP TABLE IF EXISTS ${DB_SCHEMA}.bc_large_grid;
    DROP TABLE IF EXISTS ${DB_SCHEMA}.bc_small_grid;
  `);
}
