import { NavLink } from 'react-router';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';

type PropTypes = {
  teams: Record<PropertyKey, any>[];
};
const MyTeams = ({ teams }: PropTypes) => {
  return (
    <section className="my-teams">
      <h2>My Teams</h2>
      <p>You're currently registered as a member of the following teams.</p>
      <StyledTable>
        <thead>
          <tr>
            <th>Team</th>
            <th>Team Lead</th>
            <th>Join Date</th>
            <th>View Team</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr>
              <td>{t.team_name}</td>
              <td>{t.team_founder}</td>
              <td>{t.join_date}</td>
              <td>
                <NavLink className="navlink-as-btn" to={`/teams/team/${t.team_id}`}>
                  View Team
                </NavLink>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
      {/* TODO: Lock to Data Managers/Admin only.  */}
      <NavLink to="/teams/create">Create New Team</NavLink>
    </section>
  );
};
export default MyTeams;
