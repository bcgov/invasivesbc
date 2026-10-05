import { useEffect, useState } from 'react';
import MyInvitations from './subcomponents/MyInvitations/MyInvitations';
import MyTeams from './subcomponents/MyTeams/MyTeams';
import useTeamsManagement from './subcomponents/useTeamManagement.hooks';
import { useSelector } from 'utils/use_selector';
import { InvitationOut, TeamMembershipOut } from 'api/api-schema';
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

  if (!online) {
    return (
      <div id="my-teams-page">
        <div className="content">
          <p>
            <b>Sorry, teams is not available while offline.</b>
          </p>
        </div>
      </div>
    );
  }
  if (!membershipDetails) return null;
  return (
    <div id="my-teams-page">
      <div className="content">
        <MyTeams membershipDetails={membershipDetails} />
        <MyInvitations invitations={invitations} refresh={loadInfo} />
      </div>
    </div>
  );
};

export default MyTeamsPage;
