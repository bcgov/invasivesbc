import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useEffect, useState } from 'react';
import Spinner from 'UI/Spinner/Spinner';

interface ReportProps {
  reportId: string;
}

const Report: React.FC<ReportProps> = ({ reportId }) => {
  const [iframeUrl, setIframeUrl] = useState(null);

  const api = useInvasivesApi();

  useEffect(() => {
    api.getEmbeddedMetabaseReport(reportId).then((result) => {
      setIframeUrl(result.embeddedUrl);
    });
  }, [reportId]);

  if (!iframeUrl) {
    return <Spinner />;
  }

  return (
    <div>
      <iframe title="metabase-iframe" src={iframeUrl} frameBorder="0" width="100%" height="600" allowTransparency />
    </div>
  );
};

export { Report };
