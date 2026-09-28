import { GroupAdd, PersonAdd } from '@mui/icons-material';
import { InviteUserToTeamSchema } from 'api/api-schema';
import FormCode from 'interfaces/FormCode';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { greaterThanEqual } from 'UI/Features/Records/Activity/forms/common/validators';
import Button from 'UI/Reusable/Button/Button';
import { useSelector } from 'utils/use_selector';

type PropTypes = {
  teamId?: number | string;
  refreshTeam: Function;
};

const InviteMember = ({ teamId, refreshTeam }: PropTypes) => {
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const URL = `${API_BASE}/ninja/teams/team/${teamId}/invite`;

  const getSuggestedUsers = async () => {
    const res = await fetch(URL, {
      method: 'GET',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
    });
    if (!res?.ok) return;
    const data = await res.json();
    setOptions(data);
  };

  const onSubmit = async (data: InviteUserToTeamSchema) => {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res?.ok) {
      await refreshTeam();
      reset();
    }
  };

  const [options, setOptions] = useState<Array<FormCode>>([]);
  const [active, setActive] = useState<boolean>(false);
  const methods = useForm<InviteUserToTeamSchema>({
    mode: 'all',
    defaultValues: { subject: '' }
  });

  useEffect(() => {
    (async () => {
      await getSuggestedUsers();
    })();
  }, []);

  const { handleSubmit, reset } = methods;
  if (!active)
    return (
      <Button size="sm" variant="contained" onClick={() => setActive(true)}>
        <GroupAdd />
        &nbsp; Invite Users
      </Button>
    );
  return (
    <div className="invite-user">
      <FormProvider {...methods}>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <SingleSelect
            name={'subject'}
            label="Username"
            required
            options={options}
            rules={{ required: true, validate: (v) => greaterThanEqual(v, 5) }}
          />
          <Button type="submit" variant="contained">
            <PersonAdd />
            &nbsp; Invite
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};
export default InviteMember;
