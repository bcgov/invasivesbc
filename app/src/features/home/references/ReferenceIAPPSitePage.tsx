import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Box, Typography } from '@mui/material';

export const ReferenceIAPPSitePage: React.FC = (props) => {
  const urlParams: { id: string } = useParams();
  const dataAccess = useDataAccess();
  let id: string = undefined;

  const [poi, setPOI] = useState(null);

  // grabs id from appState if URL is empty, if both are empty - id is undefined and message shows up
  if (urlParams.id === undefined) {
    const appStateResults = dataAccess.getAppState();
    id = appStateResults.activeIappSite;
  } else {
    id = urlParams.id;
  }

  useEffect(() => {
    const fetchPOI = async () => {
      const poiData = await dataAccess.getPointsOfInterest({ iappSiteID: id, isIAPP: true });
      setPOI(poiData.rows[0]);
    };

    if (!poi && id) {
      fetchPOI();
    }
  }, [poi, dataAccess, urlParams.id, id]);

  return (
    <div id="iapp_site" style={{ marginTop: 30, marginBottom: 30 }}>
      {!id && (
        <>
          <Box m={3}>
            <Typography variant="h4">Current IAPP Site </Typography>
          </Box>
          <Typography m={3}>
            There is no current IAPP Site selected. When you select and IAPP record, it will become your current IAPP
            site and show up in this tab.
          </Typography>
        </>
      )}
      {id && poi && <IAPPSite record={poi} />}
    </div>
  );
};
