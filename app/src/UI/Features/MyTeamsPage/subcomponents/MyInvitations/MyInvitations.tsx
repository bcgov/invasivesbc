import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import useTeamsManagement from '../useTeamManagement.hooks';
import Button from 'UI/Reusable/Button/Button';
import { Cancel, CheckCircle } from '@mui/icons-material';
import moment from 'moment';
import './myInvitations.css';
import { InvitationOut, InviteStatus } from 'api/api-schema';
import ConfirmationButton from 'UI/Reusable/ConfirmationButton/ConfirmationButton';

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
          Review your pending team invitations below. Accepting an invite gives the team owner access to edit records
          with shared agencies or employers created while you're part of the team.
        </p>
      </hgroup>
      <StyledTable>
        <thead>
          <tr>
            <th>Team</th>
            <th>Description</th>
            <th>Founder can edit records containing</th>
            <th>Date of invitation</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invitations?.map((i) => (
            <tr key={i.id}>
              <td>
                <p>
                  <b>{i.name}</b>
                </p>
                <p>
                  <b>Founder:&nbsp;</b>
                  {i.founder}
                </p>
              </td>
              <td>{i.description}</td>
              <td>
                <p>
                  <b>Agencies:&nbsp;</b> {i.agencies ?? 'None'}
                </p>
                <p>
                  <b>Employers:&nbsp;</b> {i.employers ?? 'None'}
                </p>
              </td>
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
                  <ConfirmationButton
                    variant="outlined"
                    className="action-btn cancel"
                    onClick={() => handleInvitationResponse(i.id, 'Declined')}
                  >
                    <Cancel /> &nbsp; Decline
                  </ConfirmationButton>
                </div>
              </td>
            </tr>
          ))}
          {invitations.length === 0 && (
            <tr>
              <td colSpan={6}>You currently have no invitations to join a team.</td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </section>
  );
};
export default MyInvitations;
