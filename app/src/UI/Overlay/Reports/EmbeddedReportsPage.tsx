import React, { useEffect, useState } from 'react';
import { useInvasivesApi } from '../../../hooks/useInvasivesApi';
import { Autocomplete, Box, Container, TextField, Typography } from '@mui/material';
import { Report } from './Report';
import Spinner from 'UI/Spinner/Spinner';
import { useSelector } from 'react-redux';
import { selectAuth } from 'state/reducers/auth';
import './Report.css';
import { useHistory } from 'react-router-dom';

const EmbeddedReportsPage: React.FC = () => {
  const authenticated = useSelector((state: any) => state?.Auth.authenticated && state?.Auth.roles.length > 0);
  const history = useHistory();

  if (!authenticated) {
    history.push('/');
  }
  const api = useInvasivesApi();
  const metabaseIconUrl = '/assets/icon/metabase-icon.svg';
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeReport, setActiveReport] = useState<number>(null);
  const [loading, setLoading] = useState(true);
  const authState = useSelector(selectAuth);

  const options = reports.map((report) => {
    const category = report.category;
    return {
      category,
      ...report
    };
  });

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }

    api.listEmbeddedMetabaseReports().then((data) => {
      setReports(data.result);
      setCategories(
        data.result
          .map((report) => report.category)
          .reduce((all_categories, category) => {
            if (!all_categories.includes(category)) {
              return all_categories.concat(category);
            }
            return all_categories;
          }, [])
      );
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
            setActiveReport(report.id);
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
