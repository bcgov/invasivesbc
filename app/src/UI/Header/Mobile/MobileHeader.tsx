import InvBcLogo from 'UI/InvBcLogo/InvBcLogo';
import 'UI/Header/Mobile/MobileHeader.css';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NavTab from 'UI/Header/NavTab';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useSelector } from 'utils/use_selector';
import { Home, Map } from '@mui/icons-material';
import HeaderPopover from 'UI/Header/Mobile/HeaderPopover';
import { OfflineSyncHeaderButton } from 'UI/Header/OfflineSyncHeaderButton';
import { AndroidMemoryReport } from 'UI/Header/Mobile/AndroidMemoryReport';
import { Platform, PLATFORM } from 'state/build-time-config';

const MobileHeader = () => {
  const activeIAPP = useSelector((state) => state.UserSettings.activeIAPP) || undefined;
  const activeActivity = useSelector((state) => state.UserSettings.activeActivity) || undefined;
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);

  return (
    <header id="nav-header">
      <InvBcLogo />
      <nav>
        <NavTab
          key={'tab1'}
          path={'/Landing'}
          predicate={'always'}
          platform={'both'}
          label="Home"
          panelOpen={true}
          panelFullScreen={true}
        >
          <Home className="nav-icon" />
        </NavTab>
        <NavTab
          key={'tab8'}
          path={'/Map'}
          label="Map"
          predicate={'unauthenticated'}
          platform={'both'}
          panelFullScreen={false}
          panelOpen={false}
        >
          <Map className="nav-icon" />
        </NavTab>
        <NavTab
          path="/Records"
          label="Records"
          predicate={'authenticated_any'}
          platform={'both'}
          panelOpen={true}
          panelFullScreen={false}
        >
          <ManageSearchIcon className="nav-icon" />
        </NavTab>
        <NavTab
          path={'/Records/Activity:' + activeActivity + '/form'}
          label={isCellPhoneWidth ? 'Activity' : 'Current Activity'}
          predicate={'authenticated_any'}
          platform={'both'}
          panelOpen={true}
          panelFullScreen={false}
        >
          <AssignmentIcon className="nav-icon" />
        </NavTab>
        <NavTab
          path={'/Records/IAPP/' + activeIAPP + '/summary'}
          label={isCellPhoneWidth ? 'IAPP' : 'Current IAPP'}
          predicate={'authenticated_any'}
          platform={'both'}
          panelOpen={true}
          panelFullScreen={false}
        >
          <img
            alt="IAPP logo"
            className="nav-icon iapp-logo"
            src={'/assets/iapp_logo.gif'}
            style={{ marginBottom: '0px', maxWidth: '20px', objectFit: 'contain' }}
          />
        </NavTab>
        {loggedInOrWorkingOffline && <OfflineSyncHeaderButton />}
      </nav>
      {PLATFORM == Platform.ANDROID && <AndroidMemoryReport />}
      <HeaderPopover />
    </header>
  );
};

export default MobileHeader;
