import { PropsWithChildren } from 'react';
import { useSelector } from 'utils/use_selector';
import OverlayContentWrapper from 'UI/Reusable/OverlayContentWrapper/OverlayContentWrapper';
import './onlineOnlyWrapper.css';

const OnlineOnlyWrapper = ({ children }: PropsWithChildren) => {
  const online = useSelector((state) => state.Network.connected);

  if (!online) {
    return (
      <OverlayContentWrapper backButton>
        <div className="system-status-online-only">
          <p>You're currently offline. Connect to the internet to use this feature.</p>
        </div>
      </OverlayContentWrapper>
    );
  }
  return children;
};

export default OnlineOnlyWrapper;
