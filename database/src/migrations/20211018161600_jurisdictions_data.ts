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

export const bcGeo = {
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

    CREATE INDEX IF NOT EXISTS jurisdiction_geom_idx ON public.jurisdiction USING gist (geom);

    ALTER TABLE jurisdiction
    ADD COLUMN IF NOT EXISTS code_name varchar(10);

    update public.jurisdiction set code_name='CPR' where jurisdictn='CP Rail';
    update public.jurisdiction set code_name='GRVM' where jurisdictn='Gravel - MOTI';
    update public.jurisdiction set code_name='RAIL' where jurisdictn='Other Rail';
    update public.jurisdiction set code_name='P' where jurisdictn='Private';
    update public.jurisdiction set code_name='MOF' where jurisdictn='Ministry of Forests, Lands, Natural Resource Operations & Rural Development';
    update public.jurisdiction set code_name='IR' where jurisdictn='First Nations Reserves';
    update public.jurisdiction set code_name='GRVF' where jurisdictn='Gravel - FLNRO';
    update public.jurisdiction set code_name='MOT' where jurisdictn='Ministry of Transportation and Infrastructure';
    update public.jurisdiction set code_name='GL' where jurisdictn='Grazing lease';
    update public.jurisdiction set code_name='BCR' where jurisdictn='BC Rail';
    update public.jurisdiction set code_name='MOP' where jurisdictn='Municipality owned land';
    update public.jurisdiction set code_name='MW' where jurisdictn='Ministry of Environment & Climate Change Strategy';
    update public.jurisdiction set code_name='CNR' where jurisdictn='CN Rail';
    update public.jurisdiction set code_name='HYDR' where jurisdictn='BC Hydro and Power Authority';
    update public.jurisdiction set code_name='MOP' where jurisdictn='Municipality';
    update public.jurisdiction set code_name='FED' where jurisdictn='Federal';
  `;

    await knex.raw(sql);
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

    DROP INDEX IF EXISTS public.jurisdiction_geom_idx;
  `);
}
