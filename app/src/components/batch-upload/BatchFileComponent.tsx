import React, { useCallback, useState } from 'react';
import { Button } from '@mui/material';
import { useDropzone } from 'react-dropzone';

const dropzoneStyle = {
  backgroundColor: 'silver',
  color: '#464646',
  border: '2px solid rgba(0,0,0,0.2)',
  backgroundClip: 'padding-box',
  borderRadius: '4px',
  cursor: 'pointer'
} as React.CSSProperties;


const BatchFileComponent = ({ setData, ready, disabled }) => {
  const [filename, setFilename] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => setStatusMessage('file reading was aborted');
      reader.onerror = () => setStatusMessage('file reading has failed');

      reader.onload = () => {
        const encodedString = btoa(reader.result as string);
        setData(encodedString);
      };

      setStatusMessage(null);
      setFilename(file.name);

      reader.readAsText(file, 'utf-8');
    });
  }, []);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, validator: fileValidator });

  return (
    <>
      {ready && <span>{filename} ready to upload</span>}
      {!ready && (
        <div style={dropzoneStyle} {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? <p>Drop here</p> : <p>Click to select a file to upload</p>}
        </div>
      )}
      {statusMessage != null && <p>{statusMessage}</p>}
      <div>
        <Button
          variant={'outlined'}
          disabled={disabled}
          onClick={() => {
            setFilename(null);
            setStatusMessage(null);
            setData(null);
          }}>
          Clear
        </Button>
      </div>
    </>
  );
};

export default BatchFileComponent;
