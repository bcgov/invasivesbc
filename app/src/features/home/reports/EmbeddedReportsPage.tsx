import React, { useEffect, useState } from 'react';
import { Report } from '../../../components/embedded-reports/Report';
import { useInvasivesApi } from '../../../hooks/useInvasivesApi';
import { Button } from '@mui/material';

const EmbeddedReportsPage: React.FC = () => {
  const api = useInvasivesApi();

  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
    api.listEmbeddedMetabaseReports().then((data) => {
      console.dir(data);
      setReports(data.result);
    });
  }, []);

  return (
    <>
      <ul>
        {reports.map((r) => (
          <li key={r.id}>
            <Button onClick={() => setActiveReport(r.id)} disabled={activeReport === r.id}>
              {r.name}
            </Button>
          </li>
        ))}
      </ul>
      {activeReport && <Report reportId={activeReport} />}
    </>
  );
};

export { EmbeddedReportsPage };
