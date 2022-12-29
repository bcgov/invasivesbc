import { Box, Button, Paper, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
//import { useDropzone } from 'react-dropzone';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';

export interface IBatchUploadRequest {
  data: string;
}

const dropzoneStyle = {
  backgroundColor: 'silver',
  color: '#464646',
  border: '2px solid rgba(0,0,0,0.2)',
  backgroundClip: 'padding-box',
  borderRadius: '4px',
  cursor: 'pointer'
} as React.CSSProperties;

type BatchUploaderProps = {
  onUploadComplete: () => void;
};

const BatchUploader: React.FC<BatchUploaderProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const [uploadRequest, setUploadRequest] = useState({
    data: null
  });

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Do something with the files

      acceptedFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');

        reader.onload = () => {
          const encodedString = btoa(reader.result as string);

          setUploadRequest({
            ...uploadRequest,
            data: encodedString
          });
        };

        setStatusMessage(null);
        setFilename(file.name);
        reader.readAsText(file, 'utf-8');
      });
    },
    [uploadRequest]
  );

  const fileValidator = (file) => {
    if (file.name.toLowerCase().endsWith('csv')) {
      return null;
    }
    setStatusMessage(`File has incorrect extension`);
    return {
      code: 'wrong-extension',
      message: 'File has incorrect extension (should be CSV)'
    };
  };

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop
  // });

  const api = useInvasivesApi();

  const doUpload = async () => {
    setUploading(true);
    try {
      const result = await api.postBatchUpload(uploadRequest);
      setStatusMessage(`Upload ${result.id} complete, see table for detailed status information`);
    } catch {
      setStatusMessage(`Upload failed!`);
    }
    setUploading(false);
    setFilename(null);
    setUploadRequest({
      data: null
    });
    onUploadComplete();
  };
  //
  // return (
  //   <Paper>
  //     <Box mx={3} my={3} py={3}>
  //       <Typography variant={'h4'}>Batch Upload</Typography>
  //       {uploadRequest.data != null && <span>{filename} ready to upload</span>}
  //       {uploadRequest.data == null && (
  //         <div style={dropzoneStyle}>
  //           <input {...getInputProps()} />
  //           {isDragActive ? <p>Drop here</p> : <p>Click to select a file to upload</p>}
  //         </div>
  //       )}
  //       {statusMessage != null && <p>{statusMessage}</p>}
  //       <div>
  //         <Button variant={'contained'} disabled={uploadRequest.data == null || uploading} onClick={() => doUpload()}>
  //           Upload
  //         </Button>
  //         <Button
  //           variant={'outlined'}
  //           disabled={uploadRequest.data == null}
  //           onClick={() => {
  //             setUploadRequest({ data: null });
  //             setFilename(null);
  //             setStatusMessage(null);
  //           }}>
  //           Clear
  //         </Button>
  //       </div>
  //     </Box>
  //   </Paper>
  // );
};

export default BatchUploader;
