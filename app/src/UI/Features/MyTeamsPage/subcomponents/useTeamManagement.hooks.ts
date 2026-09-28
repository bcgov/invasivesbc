import teamAlertMessages from 'constants/alerts/teamAlerts';
import { useNavigate } from 'react-router';
import { InvitationResponseSchema, InviteStatus, InviteUserToTeamSchema } from 'api/api-schema';
import Alerts from 'state/actions/alerts/Alerts';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useDispatch, useSelector } from 'utils/use_selector';
import AlertMessage from 'interfaces/AlertMessage';

const useTeamsManagement = () => {
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const BASE = `${API_BASE}/ninja/teams`;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const alert = (alert: AlertMessage) => dispatch(Alerts.create(alert));

  const getHeaders = async () => ({
    Authorization: await getCurrentJWT(),
    'Content-Type': 'application/json'
  });

  // TEAMS
  const getTeam = async (id: string | number) => {
    const res = await fetch(`${BASE}/team/${id}`, {
      headers: await getHeaders()
    });
    if (!res?.ok) {
      alert(teamAlertMessages.getTeamFailed);
    }
    return res;
  };

  const disbandTeam = async (id: string | number) => {
    const res = await fetch(`${BASE}/team/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    alert(res?.ok ? teamAlertMessages.disbandTeamSuccess : teamAlertMessages.disbandTeamFailure);
    navigate('/teams', { replace: true });
  };

  // INVITATIONS
  const patchInvite = async (invitation_id: number, response: InviteStatus | `${InviteStatus}`) => {
    const res = await fetch(`${BASE}/invite`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify({ invitation_id, response } as InvitationResponseSchema)
    });
    alert(res?.ok ? teamAlertMessages.updateInvitationSuccess : teamAlertMessages.updateInvitationFailed);
    return res;
  };

  const inviteMember = async (teamId: string | number, data: InviteUserToTeamSchema) => {
    const res = await fetch(`${BASE}/team/${teamId}/invite`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    alert(res?.ok ? teamAlertMessages.inviteSuccess : teamAlertMessages.inviteFailed);
    return res;
  };

  const suggestMembers = async (id: string | number) => {
    const res = await fetch(`${BASE}/team/${id}/invite`, {
      method: 'GET',
      headers: await getHeaders()
    });
    if (!res?.ok) {
      dispatch(Alerts.create(teamAlertMessages.suggestionsFailed));
      return [];
    }
    return await res.json();
  };

  // USER MANAGEMENT
  const kickUserFromTeam = async (id: string | number, subject: string) => {
    const res = await fetch(`${BASE}/team/${id}/members/${subject}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    alert(res?.ok ? teamAlertMessages.removeMemberSuccess : teamAlertMessages.removeMemberFailure);
    return res;
  };

  const leaveTeam = async (id: string | number) => {
    const res = await fetch(`${BASE}/team/${id}/leave`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    alert(res?.ok ? teamAlertMessages.leaveTeamSuccess : teamAlertMessages.leaveTeamFailure);
    navigate('/teams', { replace: true });
    return res;
  };

  return {
    disbandTeam,
    getTeam,
    inviteMember,
    kickUserFromTeam,
    leaveTeam,
    patchInvite,
    suggestMembers
  };
};
export default useTeamsManagement;
