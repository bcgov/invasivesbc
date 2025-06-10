import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import FormMenuButtons from 'UI/Features/Records/FormMenuButtons/FormMenuButtons';
import { Route } from 'react-router';
import { useSelector } from 'utils/use_selector';

const ContextRoutes = () => {
  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);

  return (
    <Route
      path="/Records/Activity:*"
      exact={false}
      render={() => (
        <CustomPopover
          buttonClasses={'overlay-menu'}
          buttonText={isCellPhoneWidth ? 'Save' : 'Save Menu'}
          closeAfterPress={true}
        >
          <FormMenuButtons />
        </CustomPopover>
      )}
    />
  );
};

export default ContextRoutes;
