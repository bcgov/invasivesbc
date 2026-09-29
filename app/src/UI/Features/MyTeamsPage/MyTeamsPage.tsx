import { useEffect, useState } from 'react';
import './myTeamsPage.css';
import MyInvitations from './subcomponents/MyInvitations/MyInvitations';
import MyTeams from './subcomponents/MyTeams/MyTeams';
import useTeamsManagement from './subcomponents/useTeamManagement.hooks';
import { useSelector } from 'utils/use_selector';

const MyTeamsPage = () => {
  const loadInfo = async () => {
    const [teamsRes, invitationsRes] = await Promise.all([getTeams(), getInvitations()]);
    if (teamsRes?.ok) setTeams(await teamsRes.json());
    if (invitationsRes?.ok) setInvitations(await invitationsRes.json());
  };

  const online = useSelector((state) => state.Network.connected);
  const { getInvitations, getTeams } = useTeamsManagement();
  const [invitations, setInvitations] = useState<Record<PropertyKey, any>[]>([]);
  const [teams, setTeams] = useState<Record<PropertyKey, any>[]>([]);

  useEffect(() => {
    (async () => {
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
  return (
    <div id="my-teams-page">
      <div className="content">
        <MyTeams teams={teams} />
        <MyInvitations invitations={invitations} refresh={loadInfo} />
      </div>
    </div>
  );
};

export default MyTeamsPage;
