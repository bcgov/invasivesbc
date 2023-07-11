
import proj4 from 'proj4';

export const calc_lat_long_from_utm = (zone: number, easting: number, northing: number) => {
    proj4.defs([
      ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
      ['EPSG:AUTO', `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`]
    ]);
  
    return proj4('EPSG:AUTO', 'EPSG:4326', [easting, northing, zone]); // conversion from (long/lat) to UTM (E/N)
  };
  
  export const calc_utm = (longitude: number, latitude: number) => {
    let utmZone = ((Math.floor((longitude + 180) / 6) % 60) + 1).toString(); //getting utm zone
    proj4.defs([
      ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
      ['EPSG:AUTO', `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`]
    ]);
    const en_m = proj4('EPSG:4326', 'EPSG:AUTO', [longitude, latitude]); // conversion from (long/lat) to UTM (E/N)
    let utmEasting = Number(en_m[0].toFixed(0));
    let utmNorthing = Number(en_m[1].toFixed(0));
    return [utmZone, utmEasting, utmNorthing];
  };