import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import { kml } from '@tmcw/togeojson';
import { NONAME } from 'dns';
// node doesn't have xml parsing or a dom. use xmldom
const DOMParser = require('xmldom').DOMParser;

export const KMLUpload: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);

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
      await databaseContext.database.upsert('testing-kml', (customKML) => {
        return { ...customKML, geometry: geoFromDOM.features };
      });
    }
  };

  useEffect(() => {
    if (aFile) {
      saveKML(aFile);
    }
  }, [aFile]);

  const dropStyle = {
      opacity: 0.5,
      display: 'none'
  }

  return (
     <div style={dropStyle}>
        <DropzoneArea
        dropzoneText="Feed me some KML"
        onChange={(e) => { setAFile(e[0]); }}
        />
     </div>
  );
};

export default KMLUpload;