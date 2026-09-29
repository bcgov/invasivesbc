import teamAlertMessages from 'constants/alerts/teamAlerts';
import { useNavigate } from 'react-router';
import {
  CreateTeamSchema,
  InvitationResponseSchema,
  InviteStatus,
  InviteUserToTeamSchema,
  UpdateTeamSchema
} from 'api/api-schema';
import Alerts from 'state/actions/alerts/Alerts';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useDispatch, useSelector } from 'utils/use_selector';
import AlertMessage from 'interfaces/AlertMessage';
import FormCode from 'interfaces/FormCode';

/**
 * @desc Bundle of API Calls for Team Functionality. Preset to include failure notifications for users.
 */
const useTeamsManagement = () => {
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const BASE = `${API_BASE}/ninja/teams`;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // UTILS
  const alert = (alert: AlertMessage) => dispatch(Alerts.create(alert));

  const getHeaders = async () => ({
    Authorization: await getCurrentJWT(),
    'Content-Type': 'application/json'
  });

  // TEAMS

  const createTeam = async (data: CreateTeamSchema): Promise<Response> =>
    await fetch(`${BASE}/team`, {
      method: 'POST',
      headers: {
        Authorization: await getCurrentJWT()
      },
      body: JSON.stringify(data)
    });

  /**
   * @desc Disband a team, hiding it from view for all users, redirect user to main team page.
   */
  const disbandTeam = async (teamId: string | number): Promise<void> => {
    const res = await fetch(`${BASE}/team/${teamId}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    alert(res?.ok ? teamAlertMessages.disbandTeamSuccess : teamAlertMessages.disbandTeamFailure);
    navigate('/teams', { replace: true });
  };
  /**
   * @desc Fetch information related to a single team
   * @param teamId Team ID
   */
  const getTeam = async (teamId: string | number): Promise<Response> => {
    const res = await fetch(`${BASE}/team/${teamId}`, {
      headers: await getHeaders()
    });
    if (!res?.ok) {
      alert(teamAlertMessages.getTeamFailed);
    }
    return res;
  };

  /**
   * @desc Fetch list of all teams user is enrolled in
   */
  const getTeams = async (): Promise<Response> => {
    const res = await fetch(`${BASE}/team`, {
      headers: await getHeaders()
    });
    if (!res?.ok) alert(teamAlertMessages.getTeamsFailed);
    return res;
  };

  /**
   * @desc Update the Team name/description of a single team.
   * @param formData Form Data,
   */
  const updateTeam = async (teamId: string | number, formData: UpdateTeamSchema): Promise<Response> => {
    const res = await fetch(`${BASE}/team/${teamId}`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(formData)
    });
    if (!res?.ok) alert(teamAlertMessages.updateTeamFailed);
    return res;
  };

  // INVITATIONS

  /**
   * @desc Retrieve a list of all Pending invitations for the requesting user
   */
  const getInvitations = async (): Promise<Response> => {
    const res = await fetch(`${BASE}/invite`, {
      headers: await getHeaders()
    });
    if (!res?.ok) alert(teamAlertMessages.getInvitationsFailed);
    return res;
  };

  /**
   * @desc Invite a user to become a member of a team.
   */
  const inviteMember = async (teamId: string | number, formData: InviteUserToTeamSchema): Promise<Response> => {
    const res = await fetch(`${BASE}/team/${teamId}/invite`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(formData)
    });
    alert(res?.ok ? teamAlertMessages.inviteSuccess : teamAlertMessages.inviteFailed);
    return res;
  };

  /**
   * @desc Update a Invitation
   */
  const patchInvite = async (invitation_id: number, response: InviteStatus | `${InviteStatus}`): Promise<Response> => {
    const res = await fetch(`${BASE}/invite`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify({ invitation_id, response } as InvitationResponseSchema)
    });
    alert(res?.ok ? teamAlertMessages.updateInvitationSuccess : teamAlertMessages.updateInvitationFailed);
    return res;
  };

  /**
   * @desc Fetch a list of users with matching agencies to the team.
   * @param teamId
   */
  const suggestMembers = async (teamId: string | number): Promise<FormCode[]> => {
    const res = await fetch(`${BASE}/team/${teamId}/invite`, {
      headers: await getHeaders()
    });
    if (!res?.ok) {
      dispatch(Alerts.create(teamAlertMessages.suggestionsFailed));
      return [];
    }
    return await res.json();
  };

  // USER MANAGEMENT

  const kickUserFromTeam = async (id: string | number, subject: string): Promise<Response> => {
    const res = await fetch(`${BASE}/team/${id}/members/${subject}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    alert(res?.ok ? teamAlertMessages.removeMemberSuccess : teamAlertMessages.removeMemberFailure);
    return res;
  };

  const leaveTeam = async (id: string | number): Promise<Response> => {
    const res = await fetch(`${BASE}/team/${id}/leave`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    alert(res?.ok ? teamAlertMessages.leaveTeamSuccess : teamAlertMessages.leaveTeamFailure);
    navigate('/teams', { replace: true });
    return res;
  };

  return {
    createTeam,
    disbandTeam,
    getInvitations,
    getTeam,
    getTeams,
    inviteMember,
    kickUserFromTeam,
    leaveTeam,
    patchInvite,
    updateTeam,
    suggestMembers
  };
};
export default useTeamsManagement;
