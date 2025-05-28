import AlertsContainer from 'UI/AlertsContainer/AlertsContainer';
import UserInputModalController from 'UI/UserInputModals/UserInputModalController';
import { WebHeader } from 'UI/Header/Web/WebHeader';
import MobileHeader from 'UI/Header/Mobile/MobileHeader';
import { useSelector } from 'utils/use_selector';

/* Components that occur after the map in the layout dom, in both layouts */

const CommonPrefixComponents = () => {
  const { MOBILE } = useSelector((state) => state.Configuration.current.build);
  return (
    <>
      <AlertsContainer />
      <UserInputModalController />
      {MOBILE ? <MobileHeader /> : <WebHeader />}
    </>
  );
};

export default CommonPrefixComponents;
