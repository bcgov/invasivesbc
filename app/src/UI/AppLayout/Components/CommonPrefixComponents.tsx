import AlertsContainer from 'UI/AlertsContainer/AlertsContainer';
import UserInputModalController from 'UI/UserInputModals/UserInputModalController';
import { Header } from 'UI/Header/Header';
import React from 'react';

/* Components that occur after the map in the layout dom, in both layouts */

const CommonPrefixComponents = () => {
  return (
    <>
      <AlertsContainer />
      <UserInputModalController />
      <Header />
    </>
  );
};

export default CommonPrefixComponents;
