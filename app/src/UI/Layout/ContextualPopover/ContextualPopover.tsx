import { Route, Routes } from 'react-router';
import { useSelector } from 'utils/use_selector';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import FormMenuButtons from 'UI/Features/Records/FormMenuButtons/FormMenuButtons';

const LegacyFormMenu = () => {
  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);

  return (
    <CustomPopover
      buttonClasses={'overlay-menu'}
      buttonText={isCellPhoneWidth ? 'Save' : 'Save Menu'}
      closeAfterPress={true}
    >
      <FormMenuButtons />
    </CustomPopover>
  );
};

const ContextualPopover = () => {
  return (
    <Routes>
      <Route path="/Records/LegacyForm/:id/:mode" Component={LegacyFormMenu} />
      {/* v7 complains if there is no matching route, so we need a fallback that does nothing */}
      <Route path="/*" Component={() => null} />
    </Routes>
  );
};

export default ContextualPopover;
