import { useState } from 'react';
import { useSelector } from 'utils/use_selector';
import { Button } from '@mui/material';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { DownloadOutlined } from '@mui/icons-material';

const BatchCodeTables = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { API_BASE } = useSelector((state) => state.Configuration.current.runtime);

  const downloadCSVCodes = async () => {
    const res = await fetch(API_BASE + `/api/batch/codes`, {
      method: 'GET',
      headers: { Authorization: await getCurrentJWT(), Accept: 'text/csv' } // application/json also works
    });

    if (!res.ok) {
      setError(true);
    } else {
      const downloadURL = URL.createObjectURL(await res.blob());
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadURL;
      downloadLink.download = 'InvasivesBC CSV Code Reference.csv';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadURL);
    }
  };

  return (
    <>
      <h2>Code Tables Download</h2>
      {error && <p className={'red'}>An error occurred while downloading the CSV. Please try again later.</p>}
      <Button
        disabled={loading || error}
        variant={'contained'}
        onClick={async () => {
          setLoading(true);
          await downloadCSVCodes();
          setLoading(false);
        }}
      >
        Download Reference CSV
        <DownloadOutlined />
      </Button>
    </>
  );
};

export default BatchCodeTables;
