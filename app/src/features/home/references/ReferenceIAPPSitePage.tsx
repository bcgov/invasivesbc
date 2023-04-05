import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'state/utilities/use_selector';
import { selectIappsite } from 'state/reducers/iappsite';

const ReferenceIAPPSitePage: React.FC = (props) => {
  const iappsite = useSelector(selectIappsite);

  return (
    <div id="iapp_site" style={{ marginTop: 30, marginBottom: 30 }}>
      {!iappsite?.IAPP && (
        <>
          <Box m={3}>
            <Typography variant="h4">Current IAPP Site </Typography>
          </Box>
          <Typography m={3}>
            There is no current IAPP Site selected. When you select an IAPP record, it will become your current IAPP
            site and show up in this tab.
          </Typography>
        </>
      )}
      {iappsite?.IAPP && <IAPPSite record={iappsite?.IAPP} />}
    </div>
  );
};

export default ReferenceIAPPSitePage;
