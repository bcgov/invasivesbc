import React, { useEffect, useState } from 'react';
import { Report } from '../../../components/embedded-reports/Report';
import { useInvasivesApi } from '../../../hooks/useInvasivesApi';
import { Autocomplete, Box, Container, TextField, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Spinner from '../../../components/spinner/Spinner';

const useStyles = makeStyles((theme: Theme) => ({
  reportContainer: {
    display: 'flex',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: '1rem'
  },
  reportIFrameContainer: {
    flexGrow: 1,
    minHeight: 600,
    minWidth: 800,
    alignContent: 'center'
  },
  reportSelection: {
    '@media (min-device-width: 600px)': {
      width: 400
    },
    minHeight: 600,
    maxHeight: 1200,
    overflowY: 'scroll'
  },
  reportLink: {
    textDecoration: 'none',
    lineHeight: 1.5,
    marginLeft: '0.5rem',
    cursor: 'pointer'
  },
  reportMenuUL: {
    listStyleType: 'none',
    lineHeight: 1,
    padding: 0,
    margin: 0,
    textAlign: 'left'
  }
}));

const EmbeddedReportsPage: React.FC = () => {
  const api = useInvasivesApi();
  const classes = useStyles();
  const metabaseIconUrl = window.location.href.split('/home')[0] + '/assets/icon/metabase-icon.svg';
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const options = reports.map((report) => {
    const category = report.category;
    return {
      category,
      ...report
    };
  });

  useEffect(() => {
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
  }, []);

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
        }}>
        <i>
          Reports are embedded Metabase reports accessible from the InvasivesBC application. To view a Metabase report,
          select which report you'd like to view from the dropdown below.
        </i>
      </Box>
      <Box style={{ paddingBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        {/* MUI Dropdown for list of metabase report types */}
        <Autocomplete
          id="metabase-report-select"
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
      <Container className={classes.reportIFrameContainer}>
        <Box>{activeReport && <Report reportId={activeReport} />}</Box>
      </Container>
    </Container>
  );
};

export { EmbeddedReportsPage };
