import { NavLink } from 'react-router';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import { TeamMembershipOut } from 'api/api-schema';
import './myTeams.css';

type PropTypes = {
  membershipDetails: TeamMembershipOut;
};
const MyTeams = ({ membershipDetails }: PropTypes) => {
  return (
    <section className="my-teams">
      <h2>My Teams</h2>
      <p>You're currently registered as a member of the following teams.</p>
      <StyledTable>
        <thead>
          <tr>
            <th>Team</th>
            <th>Team Lead</th>
            <th>Description</th>
            <th>Join Date</th>
            <th>View Team</th>
          </tr>
        </thead>
        <tbody>
          {membershipDetails.teams.map((t) => (
            <tr key={t.team_id}>
              <td>{t.team_name}</td>
              <td>{t.team_founder}</td>
              <td>{t.description}</td>
              <td>{t.join_date}</td>
              <td>
                <NavLink className="navlink-as-btn" to={`/teams/team/${t.team_id}`}>
                  View Team
                </NavLink>
              </td>
            </tr>
          ))}
          {membershipDetails.teams.length === 0 && (
            <tr>
              <td colSpan={4}>You are not a member of any teams</td>
            </tr>
          )}
        </tbody>
      </StyledTable>
      {membershipDetails.can_create_team && (
        <div>
          <NavLink to="/teams/create">Create New Team</NavLink>
        </div>
      )}
    </section>
  );
};
export default MyTeams;
