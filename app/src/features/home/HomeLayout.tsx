import { Box } from '@mui/material';
import Footer from 'components/Footer/Footer';
import TabsContainer from 'components/tabs/TabsContainer';
import React from 'react';

export interface IHomeLayoutProps {
  children: any;
}

const HomeLayout: React.FC<IHomeLayoutProps> = (props: any) => {
  return (
    <Box width="100%" height="100%" display="flex" flex="1" flexDirection="column">
      <Box height="1vh - 80">
        <TabsContainer/>
      </Box>
      <Box height="100%" width="100%" overflow="auto">
        {props.children}
      </Box>
      <Box
        style={{ zIndex: 1 }}
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
