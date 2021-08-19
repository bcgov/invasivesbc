import { DatabaseContext2, query, QueryType } from 'contexts/DatabaseContext2';
import React, { useContext, useEffect, useState } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import { kml } from '@tmcw/togeojson';
import { DocType } from 'constants/database';
import { upsert, UpsertType } from 'contexts/DatabaseContext2';
import { Capacitor } from '@capacitor/core';
import unzipper from 'unzipper';
// node doesn't have xml parsing or a dom. use xmldom
import * as pako from 'pako';

const DOMParser = require('xmldom').DOMParser;
//var toString = require('stream-to-string');

export const KML_TYPES = {
  KML: 'kml',
  KMZ: 'kmz',
  OTHER: 'other'
};
const streamToString = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
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
  try {
    //  const transform: <ReadableWriteablePair> = { ReadableStream(), WritableStream() }
    const encodedText = await input
      .stream()
      .getReader()
      .read()
      .then((value) => {
        console.log(typeof value.value);
        return value.value;
      });
    const decodedText = new TextDecoder('utf-8').decode(encodedText);

    // Decode base64 (convert ascii to binary)
    var strData = atob(decodedText);

    // Convert binary string to character-number array
    var charData = strData.split('').map(function (x) {
      return x.charCodeAt(0);
    });

    // Turn number array into byte-array
    var binData = new Uint8Array(charData);

    // Pako magic
    var data = pako.inflate(binData);

    // Convert gunzipped byteArray back to ascii string:
    var ascii = String.fromCharCode.apply(null, new Uint16Array(data));

    console.log(ascii);

    console.log('unzipped');
    return ascii;
  } catch (e) {
    console.dir(e);
  }
  //  unzipper.unzip(stream, () => {})
};

const KMLStringToGeojson = (input: string) => {
  try {
    const DOMFromXML = new DOMParser().parseFromString(input);
    const geoFromDOM = kml(DOMFromXML);
    return geoFromDOM;
  } catch (e) {
    console.log('error converting kml xml string to geojson', e);
  }
};

const get_KMZ_Or_KML_AsString = async (input: File) => {
  let KMLString;
  //get kml as string
  switch (KMZ_OR_KML(input)) {
    case KML_TYPES.KML: {
      KMLString = await input.text().then((xmlString) => {
        return xmlString;
      });
      break;
    }
    case KML_TYPES.KMZ: {
      KMLString = KMZ_TO_KML(input);
      break;
    }
  }
  return KMLString;
};

export const KMLUpload: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext2);

  // Raw file kept in useState var and converted to Geo before hitting db:
  const [aFile, setAFile] = useState(null);

  const saveKML = async (input: File) => {
    const KMLString = await get_KMZ_Or_KML_AsString(input);
    console.log(KMLString);
    const geosFromString = KMLStringToGeojson(KMLString);

    if (geosFromString) {
      console.log('saving geo feat collection');
      console.dir(geosFromString);

      /*
      await upsert(
        [
          {
            type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
            ID: props.trip_ID,
            docType: DocType.TRIP,
            json: { geometry: geosFromString.features }
          }
        ],
        databaseContext
      );
    }*/
    }
  };

  useEffect(() => {
    if (aFile /*&& Capacitor.getPlatform() !== 'web'*/) {
      // check if kmz or kml
      //if kml:
      if (KMZ_OR_KML(aFile) !== KML_TYPES.OTHER) {
        saveKML(aFile);
      }
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
        e.forEach((file) => {
          console.log(KMZ_OR_KML(file));
        });
      }}
    />
  );
};

export default KMLUpload;
