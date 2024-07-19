import React, { useEffect, useState } from 'react';
import { Box, Modal, Typography } from '@mui/material';

import './MobileBetaAccessMessage.css';
import { useSelector } from 'utils/use_selector';
import { selectAuth } from 'state/reducers/auth';

export const MobileBetaAccessMessage = () => {
  const { authenticated, idir_user_guid } = useSelector(selectAuth);

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      setShow(false);
      return;
    }

    if (idir_user_guid && idir_user_guid.length > 0) {
      setShow(false);
      return;
    }

    setShow(true);
  }, [authenticated, idir_user_guid]);

  return (
    <Modal open={show} onClose={() => {}}>
      <Box className={'mobile-beta-access-modal'}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Mobile Application Access is in BETA
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Thank you for showing interest in the InvasivesBC application. This release of the mobile application is
          available for testing by IDIR account holders. A wider release is planned shortly.
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          A fully functional web application is available at{' '}
          <a href={'https://invasivesbc.gov.bc.ca/'}>https://invasivesbc.gov.bc.ca/</a>
        </Typography>
      </Box>
    </Modal>
  );
};
