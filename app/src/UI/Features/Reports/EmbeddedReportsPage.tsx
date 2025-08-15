import React, { useEffect, useState } from 'react';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { Autocomplete, Box, Container, TextField, Typography } from '@mui/material';
import { Report } from 'UI/Features/Reports/Report';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { selectAuth } from 'state/reducers/auth';
import 'UI/Features/Reports/Report.css';
import { useNavigate } from 'react-router';
import { useSelector } from 'utils/use_selector';

const EmbeddedReportsPage: React.FC = () => {
  const authenticated = useSelector((state) => state.Auth.authenticated && state.Auth.roles.length > 0);
  const navigate = useNavigate();

  if (!authenticated) {
    navigate('/');
  }
  const api = useInvasivesApi();
  const metabaseIconUrl = '/assets/icon/metabase-icon.svg';
  const [reports, setReports] = useState<{ category: string; id: number; name: string }[]>([]);
  const [activeReport, setActiveReport] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const authState = useSelector(selectAuth);

  const options = reports.map((report) => {
    return {
      ...report
    };
  });

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }

    api.listEmbeddedMetabaseReports().then((data) => {
      setReports(data.result);
      setLoading(false);
    });
  }, [authState?.authenticated]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Container style={{ paddingBottom: '50px' }}>
      <Box style={{ paddingTop: '30px', paddingBottom: '10px', display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h4" align="center">
          <Box
            style={{ paddingTop: '1rem' }}
            component="img"
            alignContent="center"
            sx={{
              height: 37,
              width: 37
            }}
            alt="Metabase Icon"
            src={metabaseIconUrl}
          />
          Metabase Reports
        </Typography>
      </Box>
      <Box
        style={{
          paddingBottom: '30px',
          marginRight: '15%',
          marginLeft: '15%',
          textAlign: 'center'
        }}
      >
        <i>
          Reports are embedded Metabase reports accessible from the InvasivesBC application. To view a Metabase report,
          select which report you'd like to view from the dropdown below. Reports are generated every night at midnight.
          Changes made to data in a given day will not be reflected in reports until the subsequent day.
        </i>
      </Box>
      <Box style={{ paddingBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        {/* MUI Dropdown for list of metabase report types */}
        <Autocomplete
          id="metabase-report-select"
          disablePortal
          options={options}
          groupBy={(option) => option.category}
          getOptionLabel={(option) => option.name}
          sx={{ width: 500 }}
          onChange={(event, report) => {
            setActiveReport(report?.id || null);
          }}
          renderInput={(params) => <TextField {...params} label="Select a Metabase Report" />}
        />
      </Box>
      <Container>
        <Box>{activeReport && <Report reportId={`${activeReport}`} />}</Box>
      </Container>
    </Container>
  );
};

export default EmbeddedReportsPage;
