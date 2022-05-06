import { Box } from '@mui/material';
import Footer from 'components/Footer/Footer';
import TabsContainer from 'components/tabs/TabsContainer';
import React from 'react';

export interface IHomeLayoutProps {
  children: any;
}

const HomeLayout: React.FC<IHomeLayoutProps> = (props: any) => {
  const [bottomPadding, setBottomPadding] = React.useState(10);

  React.useEffect(() => {
    if (props?.children[1]?.type?.name === 'LandingPage') {
      setBottomPadding(10);
    } else {
      setBottomPadding(5);
    }
  }, [props]);

  return (
    <Box width="100%" height="100%" display="flex" flex="1" flexDirection="column">
      <Box height="80px">
        <TabsContainer isMobileNoNetwork={props?.children.props?.isMobileNoNetwork} />
      </Box>
      <Box height="100%" width="100%" paddingBottom={bottomPadding} overflow="auto">
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
