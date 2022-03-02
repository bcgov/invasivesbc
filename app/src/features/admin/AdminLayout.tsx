import { Box, Collapse } from '@mui/material';
import Footer from 'components/Footer/Footer';
import TabsContainer from 'components/tabs/TabsContainer';
import React, { useState } from 'react';

export interface IAdminLayoutProps {
  children: any;
}

const AdminLayout: React.FC<IAdminLayoutProps> = (props: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box width="inherit" height="100%" display="flex" flex="1" flexDirection="column">
      <Box height="80px">
        <TabsContainer isMobileNoNetwork={false} />
      </Box>
      <Collapse timeout={50} in={isOpen}></Collapse>
      <Box height="100%" width="inherit" overflow="auto">
        {props.children}
      </Box>
      <Box
        height="20px"
        style={{ zIndex: 99999999999 }}
        position="fixed"
        bottom="0px"
        left="0"
        right="0"
        bgcolor="primary.main"
        color="primary.contrastText">
        <Footer />
      </Box>
    </Box>
  );
};

export default AdminLayout;
