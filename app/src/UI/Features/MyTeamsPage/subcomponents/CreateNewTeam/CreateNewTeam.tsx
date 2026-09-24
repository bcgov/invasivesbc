import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { greaterThanEqual, lessThanEqual, minArrayLength } from 'UI/Features/Records/Activity/forms/common/validators';
import { CreateTeamSchema } from 'api/api-schema';
import { Role } from 'constants/roles';
import { useMemo } from 'react';
import { FormProvider, get, SubmitHandler, useForm } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import './createNewTeam.css';
import Button from 'UI/Reusable/Button/Button';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useNavigate } from 'react-router';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';

const CreateNewTeam = () => {
  const methods = useForm<CreateTeamSchema>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      agencies: []
    }
  });
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const agencyCodes = useSelector((state) => state.ActivityPage.formCodes?.FundingAgencyCode) ?? [];
  const userAgencies = useSelector((state) => state.Auth?.extendedInfo?.funding_agencies)?.split?.(',');
  const username = useSelector((state) => state.Auth?.username);
  const userIsAdmin = useSelector((state) => state.Auth?.roles.some((r) => r.role_name === Role.MASTER_ADMINISTRATOR));
  const navigate = useNavigate();
  const optionsAvailableToUser = useMemo(() => {
    if (userIsAdmin) return agencyCodes;
    return agencyCodes.filter(({ code }) => userAgencies?.includes(code as string));
  }, [agencyCodes, userAgencies, username]);

  const onSubmit: SubmitHandler<CreateTeamSchema> = async (data) => {
    const res = await fetch(`${API_BASE}/ninja/teams/team`, {
      method: 'POST',
      headers: {
        Authorization: await getCurrentJWT()
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const data = await res.json();
      // Redirect to Team page.
      navigate(`/teams/${data.id}`);
    }
  };

  return (
    <section id="create-new-team">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Fieldset label={'Create a Team'} nested>
            <TextInput
              label={'Team Name'}
              required
              error={get(methods.formState.errors, 'name')}
              width={Width.Half}
              {...methods.register('name', {
                required: true,
                validate: {
                  maxLength: (val) => lessThanEqual(val, 64),
                  minLength: (val) => greaterThanEqual(val, 5)
                }
              })}
            />
            <MultiSelect
              label="Funding Agencies"
              name={'agencies'}
              options={optionsAvailableToUser}
              required
              width={Width.Half}
              rules={{ validate: (v) => minArrayLength(v, 1), required: true }}
            />
          </Fieldset>
          <Button type="submit" variant="contained">
            Create Team
          </Button>
        </form>
      </FormProvider>
    </section>
  );
};
export default CreateNewTeam;
