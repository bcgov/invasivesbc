import { useEffect, useState } from 'react';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import { useSelector } from 'utils/use_selector';

const MyInvitations = () => {
  const [activeInvitations, setActiveInvitations] = useState<unknown[]>([]);
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  useEffect(() => {
    async () => {
      const res = await fetch(`${API_BASE}/ninja/teams/invite`, {
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
      });
      if (!res?.ok) return;

      const data = await res.json();
      setActiveInvitations(data);
    };
  }, []);

  return (
    <section>
      <h2>My Invitations</h2>
      <p>Something about Invitations will be going here</p>
      <StyledTable>
        <thead>
          <tr>
            <th>Table</th>
            <th>Headers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Row</td>
            <td>One</td>
          </tr>
          <tr>
            <td>Row</td>
            <td>Two</td>
          </tr>
        </tbody>
      </StyledTable>
    </section>
  );
};
export default MyInvitations;
