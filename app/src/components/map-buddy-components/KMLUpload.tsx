import { Capacitor } from '@capacitor/core';
import { kml } from '@tmcw/togeojson';
import { DocType } from 'constants/database';
import { DatabaseContext, upsert, UpsertType } from 'contexts/DatabaseContext';
// node doesn't have xml parsing or a dom. use xmldom
import JSZip from 'jszip';
import { DropzoneArea } from 'mui-file-dropzone';
import React, { useContext, useEffect, useState } from 'react';
const DOMParser = require('xmldom').DOMParser;

export const KML_TYPES = {
  KML: 'kml',
  KMZ: 'kmz',
  OTHER: 'other'
};

const KMZ_OR_KML = (input: File) => {
  var extension = input?.name?.split('.').pop();
  switch (extension) {
    case 'kml':
      return KML_TYPES.KML;
    case 'kmz':
      return KML_TYPES.KMZ;
    default:
      break;
  }
  return KML_TYPES.OTHER;
};

const KMZ_TO_KML = async (input: File) => {
  const kmlStringArray = [];
  const zip = new JSZip();
  const unzipped = await zip.loadAsync(input);

  const keys = Object.keys(unzipped.files);
  const numKeys = keys.length;

  for (var i = 0; i < numKeys; i++) {
    const file = unzipped.file(keys[i]);
    if (KMZ_OR_KML(file as any) === KML_TYPES.KML) {
      const stringVal = await file.async('string');
      kmlStringArray.push(stringVal);
    }
  }

  return kmlStringArray;
};

const KMLStringToGeojson = (input: string) => {
  try {
    const DOMFromXML = new DOMParser().parseFromString(input);
    return kml(DOMFromXML);
  } catch (e) {
    console.log('error converting kml xml string to geojson', e);
  }
};

const get_KMorKML_AsStringArray = async (input: File) => {
  let KMLString;
  //get kml as string
  switch (KMZ_OR_KML(input)) {
    case KML_TYPES.KML: {
      KMLString = await input.text().then((xmlString) => {
        return [xmlString];
      });
      return KMLString;
    }
    case KML_TYPES.KMZ: {
      return KMZ_TO_KML(input);
    }
  }
};

export const KMLUpload: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  // Raw file kept in useState var and converted to Geo before hitting db:
  const [aFile, setAFile] = useState(null);
  const [geos, setGeos] = useState<any>();

  const saveKML = async (input: File) => {
    const KMLStringArray = await get_KMorKML_AsStringArray(input);

    //this will append all the features in KMLS in a KMZ into one feature collection:
    let allGeos: any;
    for (const KMLString of KMLStringArray) {
      const uploadedGeos = KMLStringToGeojson(KMLString);
      if (!allGeos?.features) {
        allGeos = uploadedGeos;
      } else {
        allGeos.features = [...allGeos.features, ...uploadedGeos.features];
      }
    }

    const newGeos = sanitizedGeos(allGeos);
    setGeos(newGeos);

    if (props.trip_ID) {
      await databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
                ID: props.trip_ID,
                docType: DocType.TRIP,
                json: { features: newGeos.features }
              }
            ],
            databaseContext
          );
        }
      });
    }
  };

  // some kmls have points with 3 coordinates, this is no good
  const sanitizedGeos = (inputGeos: any) => {
    const newFeatures = inputGeos?.features?.map((geo: any) => {
      const newGeo = { ...geo };
      var len: number;
      if (geo.geometry?.type === 'Point' && geo.geometry.coordinates?.length > 2) {
        newGeo.geometry.coordinates.pop();
      } else if (geo.geometry?.type === 'Polygon') {
        len = geo.geometry.coordinates.length;
        for (var i = 0; i < len; i++) {
          var iLen = newGeo.geometry.coordinates[i].length;
          for (var j = 0; j < iLen; j++) {
            newGeo.geometry.coordinates[i][j].pop();
          }
        }
      } else if (geo.geometry?.type === 'LineString') {
        len = newGeo.geometry.coordinates.length;
        for (var k = 0; k < len; k++) {
          newGeo.geometry.coordinates[k].pop();
        }
      }
      return newGeo;
    });
    return { ...inputGeos, features: [...newFeatures] };
  };

  useEffect(() => {
    if (aFile && Capacitor.getPlatform() === 'web') {
      if (KMZ_OR_KML(aFile) !== KML_TYPES.OTHER) {
        saveKML(aFile);
      }
    } else {
      //fart around in web
      //if kml:
      // validate that we have geojson in console
      // if kmz
      // convert to kml
      // validate that we have geojson in console
    }
  }, [aFile]);

  useEffect(() => {
    if (props?.setGeo && geos) {
      props.setGeo(geos.features);
    }
  }, [geos]);

  return (
    <DropzoneArea
      dropzoneText="Upload KML/KMZ here"
      onChange={(e) => {
        setAFile(e[0]);
      }}
    />
  );
};

export default KMLUpload;
