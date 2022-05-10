import React, { useEffect, useState } from 'react';
import { Report } from '../../../components/embedded-reports/Report';
import { useInvasivesApi } from '../../../hooks/useInvasivesApi';
import { Box, Container, Link, Theme, Typography } from '@mui/material';
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
    minWidth: 800
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

  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <Typography variant="h4">Embedded Reports</Typography>
      <Container className={classes.reportContainer}>
        <Box className={classes.reportSelection}>
          <Typography variant="h5">Select Report</Typography>
          {categories.map((c) => (
            <div key={c}>
              <Typography variant="h6">{c}</Typography>
              <ul className={classes.reportMenuUL}>
                {reports
                  .filter((r) => r.category === c)
                  .map((r) => (
                    <li key={r.id}>
                      <Link onClick={() => setActiveReport(r.id)} className={classes.reportLink}>
                        {r.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </Box>
        <Box className={classes.reportIFrameContainer}>{activeReport && <Report reportId={activeReport} />}</Box>
      </Container>
    </Container>
  );
};

export { EmbeddedReportsPage };
