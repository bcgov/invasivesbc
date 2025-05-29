import AlertsContainer from 'UI/Layout/AlertsContainer/AlertsContainer';
import UserInputModalController from 'UI/Reusable/UserInputModals/UserInputModalController';
import { WebHeader } from 'UI/Layout/Header/Web/WebHeader';
import MobileHeader from 'UI/Layout/Header/Mobile/MobileHeader';
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
