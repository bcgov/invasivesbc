import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import useTeamsManagement from '../useTeamManagement.hooks';
import Button from 'UI/Reusable/Button/Button';
import { Cancel, CheckCircle } from '@mui/icons-material';
import moment from 'moment';
import './myInvitations.css';
import { InvitationOut, InviteStatus } from 'api/api-schema';

type PropTypes = {
  refresh: () => void;
  invitations: Array<InvitationOut>;
};
const MyInvitations = ({ refresh, invitations }: PropTypes) => {
  const handleInvitationResponse = async (inviteId: InvitationOut['id'], response: InviteStatus) => {
    const res = await updateInvitation(inviteId, response);
    if (res?.ok) refresh();
  };

  const { updateInvitation } = useTeamsManagement();

  return (
    <section className="my-team-invitations">
      <hgroup>
        <h2>My Invitations</h2>
        <p>
          Below are your team invitations. Accepting an invite allows the team owner to edit records shared between your
          agencies.
        </p>
      </hgroup>
      <StyledTable>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Team Founder</th>
            <th>Description</th>
            <th>Agencies</th>
            <th>Date of Invitation</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invitations?.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.founder}</td>
              <td>{i.description}</td>
              <td>{i.agencies}</td>
              <td>{moment(i.date_stamp).format('YYYY-MM-DD')}</td>
              <td>{i.status}</td>
              <td>
                <div className="action-cnt">
                  <Button
                    variant="outlined"
                    className="action-btn confirm"
                    onClick={() => handleInvitationResponse(i.id, 'Accepted')}
                  >
                    <CheckCircle /> &nbsp; Accept
                  </Button>
                  <Button
                    variant="outlined"
                    className="action-btn cancel"
                    onClick={() => handleInvitationResponse(i.id, 'Declined')}
                  >
                    <Cancel /> &nbsp; Decline
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {invitations.length === 0 && (
            <tr>
              <td colSpan={7}>You currently have no invitations to join a team.</td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </section>
  );
};
export default MyInvitations;
