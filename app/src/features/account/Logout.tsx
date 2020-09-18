import React from 'react';
// import { useConfiguration } from 'hooks/useConfiguration';

import { Redirect } from 'react-router';

export const LogoutPage = () => {
  return <Redirect to="/login" />;
  //   const configuration = useConfiguration();
  //   React.useEffect(() => {
  //     if (configuration.siteMinderLogoutUrl) {
  //       window.location.replace(
  //         `${configuration.siteMinderLogoutUrl}?returl=${configuration.baseUrl}/login&retnow=1`,
  //       );
  //     }
  //   }, [configuration]);
  //   return !configuration.siteMinderLogoutUrl ? <Redirect to="/login" /> : null;
};
