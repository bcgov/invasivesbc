import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import { DropzoneArea } from 'material-ui-dropzone';
import { setMatchers } from 'expect/build/jestMatchersObject';

export interface IShapeUploadRequest {
  data: string;
  type: 'kml' | 'kmz';
}

//   var extension = input?.name?.split('.').pop();
export const KMLShapesUpload: React.FC<any> = (props) => {
  const [uploadRequest, setUploadRequest] = useState({
    type: null,
    data: null
  });

  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState(null);

  const api = useInvasivesApi();

  const doUpload = async () => {
    if (!valid) {
      return;
    }

    try {
      await api.postAdminUploadShape(uploadRequest);
      setUploadRequest(null);
      setMessage('Upload complete');
    } catch (err) {
      setMessage('Error occurred');
    }
  };

  const acceptFile = (files: File[]) => {
    if (files.length !== 1) {
      return;
    }

    const extension = files[0].name.split('.').pop();
    let fileType: string;

    if (extension.match(/kml/i)) {
      fileType = 'kml';
    } else if (extension.match(/kmz/i)) {
      fileType = 'kmz';
    } else {
      setValid(false);
      setMessage('Unrecognized extension ' + extension);
      return;
    }

    const reader = new FileReader();

    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading has failed');
    reader.onload = () => {
      const encodedString = btoa(reader.result as string);

      setUploadRequest({
        type: fileType,
        data: encodedString
      });
      setMessage('Ready to upload');
      setValid(true);
    };

    setMessage(null);
    reader.readAsBinaryString(files[0]);
  };

  return (
    <>
      <DropzoneArea dropzoneText="Upload KML/KMZ here" onChange={acceptFile} />

      {message && <p>{message}</p>}
      <Button variant={'contained'} disabled={!valid} onClick={() => doUpload()}>
        Upload
      </Button>
    </>
  );
};

export default KMLShapesUpload;
