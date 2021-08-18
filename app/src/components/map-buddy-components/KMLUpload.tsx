import { DatabaseContext2, query, QueryType } from 'contexts/DatabaseContext2';
import React, { useContext, useEffect, useState } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import { kml } from '@tmcw/togeojson';
import { DocType } from 'constants/database';
import { upsert, UpsertType } from 'contexts/DatabaseContext2';
import { Capacitor } from '@capacitor/core';
// node doesn't have xml parsing or a dom. use xmldom
const DOMParser = require('xmldom').DOMParser;

export const KMLUpload: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext2);

  // Raw file kept in useState var and converted to Geo before hitting db:
  const [aFile, setAFile] = useState(null);

  const saveKML = async (input: File) => {
    const fileAsString = await input.text().then((xmlString) => {
      return xmlString;
    });
    const DOMFromXML = new DOMParser().parseFromString(fileAsString);
    const geoFromDOM = kml(DOMFromXML);
    console.log('geo');

    if (geoFromDOM) {
      console.log('saving geo feat collection');

      await upsert(
        [
          {
            type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
            ID: props.trip_ID,
            docType: DocType.TRIP,
            json: { geometry: geoFromDOM.features }
          }
        ],
        databaseContext
      );
    }
  };

  useEffect(() => {
    if (aFile && Capacitor.getPlatform() !== 'web') {
      // check if kmz or kml
      //if kml:
      saveKML(aFile);
      //else
      //convert to kml
      //saveKml(converted)
    } else {
      //fart around in web
      //if kml:
      // validate that we have geojson in console
      // if kmz
      // convert to kml
      // validate that we have geojson in console
    }
  }, [aFile]);

  return (
    <DropzoneArea
      dropzoneText="Upload KML here"
      onChange={(e) => {
        setAFile(e[0]);
      }}
    />
  );
};

export default KMLUpload;
