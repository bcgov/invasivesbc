import { GroupAdd, PersonAdd } from '@mui/icons-material';
import { InviteUserToTeamSchema, SingleTeamOut, TeamSuggestedUserOut } from 'api/api-schema';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { greaterThanEqual } from 'UI/Features/Records/Activity/forms/common/validators';
import Button from 'UI/Reusable/Button/Button';
import useTeamsManagement from '../subcomponents/useTeamManagement.hooks';

type PropTypes = {
  teamId?: SingleTeamOut['id'];
  refreshTeam: Function;
};

const InviteMember = ({ teamId, refreshTeam }: PropTypes) => {
  const { suggestMembers, inviteMember } = useTeamsManagement();

  const getSuggestedUsers = async () => {
    if (!teamId) return;
    const suggestions = await suggestMembers(teamId);
    setOptions(suggestions);
  };

  const onSubmit = async (data: InviteUserToTeamSchema) => {
    if (!teamId) return;
    const res = await inviteMember(teamId, data);
    if (res?.ok) {
      await refreshTeam();
      reset();
    }
  };

  const [options, setOptions] = useState<TeamSuggestedUserOut[]>([]);
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
  return (
    <>
      <Button size="sm" variant="contained" onClick={() => setActive((prev) => !prev)}>
        <GroupAdd /> &nbsp; Invite
      </Button>
      <div className="invite-user">
        {active && (
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
        )}
      </div>
    </>
  );
};
export default InviteMember;
