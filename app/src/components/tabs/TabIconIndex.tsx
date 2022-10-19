import { AdminPanelSettings, Assessment, Assignment, Home, HomeWork, Map } from '@mui/icons-material';
import React from 'react';

export enum TabIconName {
  Home = 'Home',
  Map = 'Map',
  Homework = 'Homework',
  Assignment = 'Assignment',
  IAPP = 'IAPP',
  Assessment = 'Assessment',
  AdminPanelSettings = 'AdminPanelSettings'
}
export const getTabIconByName = (iconName: TabIconName): React.ReactElement => {
  switch (iconName) {
    case TabIconName.Home:
      return (
        <>
          <Home fontSize={'small'} />
        </>
      );
    case TabIconName.Map:
      return (
        <>
          <Map fontSize={'small'} />
        </>
      );
    case TabIconName.Homework:
      return (
        <>
          <HomeWork fontSize={'small'} />
        </>
      );
    case TabIconName.Assignment:
      return (
        <>
          <Assignment fontSize={'small'} />
        </>
      );
    case TabIconName.IAPP:
      return (
        <>
          <img
            alt="iapp logo"
            src={process.env.PUBLIC_URL + '/assets/iapp.gif'}
            style={{ maxWidth: '3.8rem', marginBottom: '0px' }}
          />
        </>
      );
    case TabIconName.Assessment:
      return (
        <>
          <Assessment fontSize={'small'} />
        </>
      );
    case TabIconName.AdminPanelSettings:
      return (
        <>
          <AdminPanelSettings fontSize={'small'} />
        </>
      );
    default:
      return (
        <>
          <Home fontSize={'small'} />
        </>
      );
  }
};
