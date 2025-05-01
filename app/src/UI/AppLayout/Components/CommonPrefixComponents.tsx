import AlertsContainer from 'UI/AlertsContainer/AlertsContainer';
import UserInputModalController from 'UI/UserInputModals/UserInputModalController';
import { Header } from 'UI/Header/Header';
import { MOBILE } from 'state/build-time-config';
import MobileHeader from 'UI/MobileHeader/MobileHeader';

/* Components that occur after the map in the layout dom, in both layouts */

const CommonPrefixComponents = () => {
  return (
    <>
      <AlertsContainer />
      <UserInputModalController />
      {MOBILE ? <MobileHeader /> : <Header />}
    </>
  );
};

export default CommonPrefixComponents;
