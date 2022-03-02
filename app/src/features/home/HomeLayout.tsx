import { Box, Collapse } from '@mui/material';
import Footer from 'components/Footer/Footer';
import TabsContainer from 'components/tabs/TabsContainer';
import React, { useState } from 'react';

export interface IHomeLayoutProps {
  children: any;
}

const HomeLayout: React.FC<IHomeLayoutProps> = (props: any) => {
  return (
    <Box width="inherit" height="100%" display="flex" flex="1" flexDirection="column">
      <TabsContainer isMobileNoNetwork={props?.children?.props?.isMobileNoNetwork} />

      {/* <Collapse timeout={50} in={isOpen}></Collapse> */}
      <Box height="100%" width="inherit" overflow="auto">
        {props.children}
      </Box>
      <Box
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

export default HomeLayout;
