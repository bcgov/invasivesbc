import { useEffect, useState } from 'react';
import MyInvitations from './subcomponents/MyInvitations/MyInvitations';
import MyTeams from './subcomponents/MyTeams/MyTeams';
import useTeamsManagement from './subcomponents/useTeamManagement.hooks';
import { useSelector } from 'utils/use_selector';
import { InvitationOut, TeamMembershipOut } from 'api/api-schema';
import OverlayContentWrapper from 'UI/Reusable/OverlayContentWrapper/OverlayContentWrapper';
import OnlineOnlyWrapper from 'UI/Features/SystemStatusPages/OnlineOnlyWrapper/OnlineOnlyWrapper';
import './myTeamsPage.css';

const MyTeamsPage = () => {
  const loadInfo = async (): Promise<void> => {
    try {
      const [teamsRes, invitationsRes] = await Promise.all([getTeams(), getInvitations()]);
      if (teamsRes?.ok) setMembershipDetails(await teamsRes.json());
      if (invitationsRes?.ok) setInvitations(await invitationsRes.json());
    } catch (e) {
      console.error('[loadInfo]', e);
    }
  };

  const { getInvitations, getTeams } = useTeamsManagement();
  const online = useSelector((state) => state.Network.connected);

  const [invitations, setInvitations] = useState<InvitationOut[]>([]);
  const [membershipDetails, setMembershipDetails] = useState<TeamMembershipOut>();

  useEffect(() => {
    void (async () => {
      if (!online) return;
      await loadInfo();
    })();
  }, [online]);

  return (
    <OnlineOnlyWrapper>
      <OverlayContentWrapper>
        <div id="my-teams-page">
          <MyTeams membershipDetails={membershipDetails} />
          <MyInvitations invitations={invitations} refresh={loadInfo} />
        </div>
      </OverlayContentWrapper>
    </OnlineOnlyWrapper>
  );
};

export default MyTeamsPage;
