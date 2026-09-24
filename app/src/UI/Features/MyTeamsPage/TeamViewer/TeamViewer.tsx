import { useParams } from 'react-router';
import { ReactNode, useEffect, useState } from 'react';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useSelector } from 'utils/use_selector';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import moment from 'moment';
import { Button } from '@mui/material';
import './teamViewer.css';
import { InvitationResponseSchema, InviteStatus } from 'api/api-schema';

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
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<Record<PropertyKey, unknown>>({});
  const fetchTeamInfo = async () => {
    const res = await fetch(`${API_BASE}/ninja/teams/team/${id}`, {
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
    });
    if (!res?.ok) return;

    const data = await res.json();
    setDetails(data);
  };
  const handleEditInvitation = async (invitation_id: number, response: InviteStatus) => {
    const res = await fetch(`${API_BASE}/ninja/teams/invite`, {
      method: 'PATCH',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitation_id, response } as InvitationResponseSchema)
    });
    if (res?.ok) await fetchTeamInfo();
  };
  const MEMBER_TOOLTIP = 'These are InvasivesBC users belonging to the team.';
  const INVITATION_TOOLTIP = "View sent team invitations and check whether they've been accepted, pending, or expired.";

  useEffect(() => {
    (async () => {
      if (id == null) return;
      await fetchTeamInfo();
    })();
  }, [id]);

  if (!details) return null;
  return (
    <div id="team-viewer">
      <div className="content">
        <Fieldset label="Overview">
          <dl className="overview">
            <Info term={'Team Name'} definition={details?.name as string} />
            <Info term={'Team Founder'} definition={details?.founder as string} />
            <Info term={'Founding Date'} definition={details?.founding_date as string} />
          </dl>
        </Fieldset>
        <Fieldset label={'Team Members'} tooltip={MEMBER_TOOLTIP}>
          <StyledTable>
            <thead>
              <tr>
                <th>Member</th>
                <th>Join Date</th>
                <th>Leave Date</th>
              </tr>
            </thead>
            <tbody>
              {details?.members?.map((t) => (
                <tr>
                  <td>{t.name}</td>
                  <td>{t?.join_date}</td>
                  <td>{t?.leave_date ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </Fieldset>

        {!!details?.invitations && (
          <Fieldset label={'Invitation Statuses'} tooltip={INVITATION_TOOLTIP}>
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
                {/* TODO: Type this */}
                {(details?.invitations as Record<PropertyKey, any>[])?.map((t) => (
                  <tr>
                    <td>{t.invitee}</td>
                    <td>{moment(t?.date_stamp).format('YYYY-MM-DD')}</td>
                    <td>{t?.status}</td>
                    <td>
                      {t.status === 'Pending' && (
                        <Button variant="contained" onClick={() => handleEditInvitation(t.id, 'Cancelled')}>
                          Cancel
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
      </div>
    </div>
  );
};

export default TeamViewer;
