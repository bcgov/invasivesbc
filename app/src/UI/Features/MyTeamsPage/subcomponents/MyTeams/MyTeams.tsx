import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import { useSelector } from 'utils/use_selector';

const MyTeams = () => {
  const [myTeams, setMyTeams] = useState<unknown[]>([]);
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/ninja/teams/team`, {
        method: 'GET',
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
      });
      if (!res?.ok) return;

      const data = await res.json();
      setMyTeams(data);
    })();
  }, []);

  return (
    <section>
      <h2>My Teams</h2>
      <p>These are the teams you're enrolled in</p>
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
          {myTeams.map((t) => (
            <tr>
              <td>{t.team_name}</td>
              <td>{t.team_founder}</td>
              <td>{t.join_date}</td>
              <td>
                <NavLink to={`/teams/${t.team_id}`}>View Team</NavLink>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </section>
  );
};
export default MyTeams;
