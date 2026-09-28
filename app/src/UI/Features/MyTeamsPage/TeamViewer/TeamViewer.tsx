import { useParams } from 'react-router';
import { ReactNode, useEffect, useState } from 'react';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import moment from 'moment';
import './teamViewer.css';
import { InviteStatus } from 'api/api-schema';
import InviteMember from './InviteMember';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import Button from 'UI/Reusable/Button/Button';
import { Cancel, GroupRemove, PersonRemove } from '@mui/icons-material';
import useTeamsManagement from '../subcomponents/useTeamManagement.hooks';
import EditTeamInfo from './EditTeamInfo';

type InfoProps = {
  term: string;
  definition?: string | number | ReactNode;
};

const Info = ({ term, definition }: InfoProps) => {
  if (!definition) return;
  return (
    <div className="list-item">
      <dt>{term}</dt>
      <dd>{definition}</dd>
    </div>
  );
};

const TeamViewer = () => {
  const hooks = useTeamsManagement();

  const handleLeaveTeam = async () => {
    if (!id) return;
    await (canEdit ? hooks.disbandTeam : hooks.leaveTeam)(id);
  };
  const fetchTeamInfo = async () => {
    if (!id) return;
    const res = await hooks.getTeam(id);
    if (res?.ok) setDetails(await res.json());
  };

  const handleEditInvitation = async (invitation_id: number, response: InviteStatus | `${InviteStatus}`) => {
    const res = await hooks.patchInvite(invitation_id, response);
    if (res?.ok) await fetchTeamInfo();
  };

  const handleRemoveUser = async (subject: string) => {
    if (!id) return;
    const res = await hooks.kickUserFromTeam(id, subject);
    if (res?.ok) await fetchTeamInfo();
  };

  const { id } = useParams<{ id: string }>();

  const [details, setDetails] = useState<Record<PropertyKey, unknown>>({});

  const MEMBER_TOOLTIP = `These are the InvasivesBC users who are a member of ${details?.name}`;
  const INVITATION_TOOLTIP = "View sent team invitations and check whether they've been accepted, pending, or expired.";

  useEffect(() => {
    (async () => {
      if (id == null) return;
      await fetchTeamInfo();
    })();
  }, [id]);

  const canEdit: boolean = details?.can_edit;

  if (!details || id == undefined) return null;
  return (
    <div id="team-viewer">
      <div className="fixed-back-button">
        <BackButton />
      </div>
      <div className="content">
        <EditTeamInfo />
        <Fieldset label="Overview">
          <dl className="overview">
            <Info term={'Name'} definition={details?.name as string} />
            <Info term={'Founder'} definition={details?.founder as string} />
            <Info term={'Founding Date'} definition={details?.founding_date as string} />
            <Info term={'Description'} definition={details?.description as string} />
          </dl>
        </Fieldset>
        <Fieldset label={'Team Members'} tooltip={MEMBER_TOOLTIP}>
          <StyledTable>
            <thead>
              <tr>
                <th>Member</th>
                <th>Join Date</th>
                {canEdit && (
                  <>
                    <th>Leave Date</th>
                    <th>Edit Member</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {details?.members?.map((m) => (
                <tr>
                  <td>{m.name}</td>
                  <td>{m?.join_date}</td>
                  {canEdit && (
                    <>
                      <td>{m?.leave_date ?? 'N/A'}</td>
                      <td>
                        {/* User is not team owner and user is active member of team */}
                        {details.founder !== m.name && !m?.leave_date && (
                          <Button className="destructive" onClick={() => handleRemoveUser(m.subject)}>
                            <PersonRemove />
                            &nbsp; Remove
                          </Button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </Fieldset>

        {canEdit && (
          <Fieldset label={'Invitation Statuses'} tooltip={INVITATION_TOOLTIP}>
            <InviteMember teamId={id} refreshTeam={fetchTeamInfo} />
            <StyledTable>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(details?.invitations as Record<PropertyKey, any>[])?.map((t) => (
                  <tr>
                    <td>{t.invitee}</td>
                    <td>{moment(t?.date_stamp).format('YYYY-MM-DD')}</td>
                    <td>{t?.status}</td>
                    <td>
                      {t.status === 'Pending' && (
                        <Button className="destructive" onClick={() => handleEditInvitation(t.id, 'Cancelled')}>
                          <Cancel /> &nbsp; Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {(details?.invitations as Record<PropertyKey, any>[]) &&
                  (details?.invitations as Record<PropertyKey, any>[]).length == 0 && (
                    <tr className="empty-row">
                      <td colSpan={4}>There are no invitations for this team</td>
                    </tr>
                  )}
              </tbody>
            </StyledTable>
          </Fieldset>
        )}
        <Button variant="destructive" onClick={handleLeaveTeam}>
          <GroupRemove /> &nbsp; {canEdit ? 'Disband Team' : 'Leave Team'}
        </Button>
      </div>
    </div>
  );
};

export default TeamViewer;
