import AlertsContainer from 'UI/AlertsContainer/AlertsContainer';
import UserInputModalController from 'UI/UserInputModals/UserInputModalController';
import { WebHeader } from 'UI/Header/Web/WebHeader';
import { MOBILE } from 'state/build-time-config';
import MobileHeader from 'UI/Header/Mobile/MobileHeader';

/* Components that occur after the map in the layout dom, in both layouts */

const CommonPrefixComponents = () => {
  return (
    <>
      <AlertsContainer />
      <UserInputModalController />
      {MOBILE ? <MobileHeader /> : <WebHeader />}
    </>
  );
};

export default CommonPrefixComponents;
