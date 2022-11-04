import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Box, Typography } from '@mui/material';
import { selectUserSettings } from 'state/reducers/userSettings';
import { useSelector } from 'state/utilities/use_selector';

export const ReferenceIAPPSitePage: React.FC = (props) => {
  const dataAccess = useDataAccess();

  const [poi, setPOI] = useState(null);

  const userSettings = useSelector(selectUserSettings);

  useEffect(() => {
    const fetchPOI = async () => {
      const poiData = await dataAccess.getPointsOfInterest({ iappSiteID: userSettings?.activeIAPP, isIAPP: true });
      setPOI(poiData.rows[0]);
    };

    if (!poi && userSettings?.activeIAPP) {
      fetchPOI();
    }
  }, [poi, dataAccess, userSettings?.activeIAPP]);

  return (
    <div id="iapp_site" style={{ marginTop: 30, marginBottom: 30 }}>
      {!userSettings?.activeIAPP && (
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
      {userSettings?.activeIAPP && poi && <IAPPSite record={poi} />}
    </div>
  );
};
