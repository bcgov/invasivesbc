import { SQL, SQLStatement } from 'sql-template-strings';

type Bounds = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

function boundsToWKTPolygon(b: Bounds) {
  const { minLatitude: minLat, maxLatitude: maxLat, minLongitude: minLng, maxLongitude: maxLng } = b;
  // WKT in lon lat order
  return `POLYGON((${{ minLng }} ${{ minLat }},${{ maxLng }} ${{ minLat }},${{ maxLng }} ${{ maxLat }},${{ minLng }} ${{
    maxLat
  }},${{ minLng }} ${{ minLat }}))`;
}

export const getAreaOfInterestTileCoordinates = (bounds: any, maxZoom: number): SQLStatement => {
  if (!bounds || !maxZoom) return null;
  // const aoiWkt = boundsToWKTPolygon(bounds);
  const { minLatitude: minLat, maxLatitude: maxLat, minLongitude: minLng, maxLongitude: maxLng } = bounds;
  // const aoiJSON = JSON.stringify(aoiWkt);
  // console.log({ message: '===->' + aoiJSON });
  return SQL`
    with aoi as (
      select st_transform(
          st_geomfromtext(${`POLYGON((${minLng} ${minLat},${maxLng} ${minLat},${maxLng} ${maxLat},${minLng} ${maxLat},${minLng} ${minLat}))`}, 4326), 
        3857) as g 
      
    ),
    touching as (
      select s.gid::text as sheet_id, '50k'::text as scale
      from invasivesbc.nts_50k_grid s, aoi
      where st_intersects(s.geom_3857, aoi.g)
    ),
    want_z as (
      select generate_series(0,${maxZoom},1) as z
    ),
    tiles as (
      select t.z, t.x, t.y
      from touching ts
      join invasivesbc.bc_sheet_tiles t
      on t.sheet_id = ts.sheet_id
      and t.scale = ts.scale
      join want_z wz
      on wz.z=t.z
    ),
    uniq as (
      select distinct z,x,y from tiles
    ),
    final as (
      select u.z, u.x, u.y
      from uniq u, aoi
      where st_intersects(aoi.g, st_tileEnvelope(u.z,u.x,u.y))
    )
    select z, x, y from final order by z,x,y;
    `;
};
