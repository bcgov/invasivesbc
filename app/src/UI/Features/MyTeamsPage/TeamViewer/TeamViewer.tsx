import { useParams } from 'react-router';
import { ReactNode, useEffect, useState } from 'react';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import moment from 'moment';
import { InviteStatus, SingleTeamOut } from 'api/api-schema';
import InviteMember from './InviteMember';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import Button from 'UI/Reusable/Button/Button';
import { Cancel, GroupRemove, PersonRemove, Refresh } from '@mui/icons-material';
import useTeamsManagement from '../subcomponents/useTeamManagement.hooks';
import EditTeamInfo from './EditTeamInfo';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import ConfirmationButton from 'UI/Reusable/ConfirmationButton/ConfirmationButton';
import './teamViewer.css';

type InfoProps = {
  term: string;
  definition?: string | number | ReactNode;
};

const Info = ({ term, definition }: InfoProps) => {
  return (
    <div className="list-item">
      <dt>{term}</dt>
      <dd>{definition || 'None'}</dd>
    </div>
  );
};

const TeamViewer = () => {
  const MEMBER_TOOLTIP = `These are the InvasivesBC users who are registered as members of the team.`;
  const INVITATION_TOOLTIP = "View sent team invitations and check whether they've been accepted, pending, or expired.";

  const handleLeaveTeam = async () => {
    if (!teamId) return;
    await (canEdit ? hooks.disbandTeam : hooks.leaveTeam)(teamId);
  };

  /**
   * @desc Handle the initial team load, render Error/Loading State as needed
   */
  const initTeamLoad = async (): Promise<void> => {
    try {
      setLoading(true);
      setLoadFailed(false);
      await refreshTeamInformation();
      setLoading(false);
    } catch (e) {
      console.error('[initTeamLoad]', e);
      setLoadFailed(true);
    }
  };

  const refreshTeamInformation = async (): Promise<void> => {
    if (!teamId) return;
    try {
      const res = await hooks.getTeam(teamId);
      setDetails(await res.json());
    } catch (e) {
      console.error('[refreshTeamInformation]', e);
    }
  };

  const handleEditInvitation = async (
    invitation_id: number,
    response: InviteStatus | `${InviteStatus}`
  ): Promise<void> => {
    try {
      const res = await hooks.updateInvitation(invitation_id, response);
      if (res?.ok) await refreshTeamInformation();
    } catch (e) {
      console.error('[handleEditInvitation]', e);
    }
  };

  const handleRemoveUser = async (subject: string): Promise<void> => {
    if (!teamId) return;
    try {
      const res = await hooks.kickUserFromTeam(teamId, subject);
      if (res?.ok) await refreshTeamInformation();
    } catch (e) {
      console.error('[handleRemoveUser]', e);
    }
  };

  const { id } = useParams<{ id: string }>();
  const teamId: SingleTeamOut['id'] = Number.parseInt(id ?? '');

  const hooks = useTeamsManagement();
  const [details, setDetails] = useState<SingleTeamOut>();
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    void (async () => {
      if (teamId == null) return;
      await initTeamLoad();
    })();
  }, [teamId]);

  const canEdit: boolean = !!details?.can_edit;

  if (loadFailed) {
    return (
      <div id="team-viewer">
        <div className="fixed-back-button">
          <BackButton />
        </div>
        <div className="content">
          <p>Something went wrong while attempting to access this team</p>
          <div className="refresh">
            <Button variant="outlined" onClick={refreshTeamInformation}>
              <Refresh color="primary" /> Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (loading || !details)
    return (
      <div id="team-viewer">
        <div className="fixed-back-button">
          <BackButton />
        </div>
        <div className="content">
          <Spinner />
          <p>Gathering information...</p>
        </div>
      </div>
    );
  return (
    <div id="team-viewer">
      <div className="fixed-back-button">
        <BackButton />
      </div>
      <div className="content">
        <Fieldset label="Overview">
          <dl className="overview">
            <Info term={'Name'} definition={details.name} />
            <Info term={'Agencies'} definition={details.agencies} />
            <Info term={'Employer(s)'} definition={details.employers} />
            <Info term={'Founder'} definition={details.founder} />
            <Info term={'Founding Date'} definition={details.founding_date} />
            <Info term={'Description'} definition={details.description} />
          </dl>
          {canEdit && <EditTeamInfo details={details} refresh={refreshTeamInformation} />}
        </Fieldset>

        <Fieldset label={'Members'} tooltip={MEMBER_TOOLTIP}>
          <StyledTable>
            <thead>
              <tr>
                <th>Member</th>
                <th>Date Joined</th>
                {canEdit && (
                  <>
                    <th>Date of Departure</th>
                    <th>Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {details.members.map((m) => (
                <tr key={m.subject}>
                  <td>{m.name}</td>
                  <td>{m?.join_date}</td>
                  {canEdit && (
                    <>
                      <td>{m?.leave_date ?? 'N/A'}</td>
                      <td>
                        {/* User is not team owner and user is active member of team */}
                        {details.founder !== m.name && !m?.leave_date && (
                          <ConfirmationButton className="destructive" onClick={() => handleRemoveUser(m.subject)}>
                            <PersonRemove />
                            &nbsp; Remove
                          </ConfirmationButton>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </Fieldset>

        {details?.invitations && (
          <Fieldset label={'Invitations'} tooltip={INVITATION_TOOLTIP}>
            <InviteMember teamId={teamId} refreshTeam={refreshTeamInformation} />
            <StyledTable>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Date Requested</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {details.invitations.map((t) => (
                  <tr key={t.id}>
                    <td>{t.invitee}</td>
                    <td>{moment(t?.date_stamp).format('YYYY-MM-DD')}</td>
                    <td>{t.status}</td>
                    <td>
                      {t.status === 'Pending' && (
                        <ConfirmationButton
                          variant="destructive"
                          onClick={() => handleEditInvitation(t.id, 'Cancelled')}
                        >
                          <Cancel /> &nbsp; Cancel
                        </ConfirmationButton>
                      )}
                    </td>
                  </tr>
                ))}
                {details.invitations.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={4}>There are no invitations for this team</td>
                  </tr>
                )}
              </tbody>
            </StyledTable>
          </Fieldset>
        )}
        <ConfirmationButton variant="contained" onClick={handleLeaveTeam}>
          <GroupRemove /> &nbsp; {canEdit ? 'Disband Team' : 'Leave Team'}
        </ConfirmationButton>
      </div>
    </div>
  );
};

export default TeamViewer;
