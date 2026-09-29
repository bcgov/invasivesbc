import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import { greaterThanEqual, lessThanEqual, minArrayLength } from 'UI/Features/Records/Activity/forms/common/validators';
import { CreateTeamSchema } from 'api/api-schema';
import { Role } from 'constants/roles';
import { useMemo, useState } from 'react';
import { FormProvider, get, SubmitHandler, useForm } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import './createNewTeam.css';
import Button from 'UI/Reusable/Button/Button';
import { useNavigate } from 'react-router';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import useTeamsManagement from '../useTeamManagement.hooks';

const CreateNewTeam = () => {
  const DESCRIPTION_TOOLTIP =
    'Enter a short description for a team. This will be viewable by all members and invitees.';
  const AGENCY_TOOLTIP = 'These are the agencies you will gain edit access for. This cannot be changed later.';

  const onSubmit: SubmitHandler<CreateTeamSchema> = async (data) => {
    setSubmissionError(undefined);
    const res = await createTeam(data);
    if (res?.ok) {
      const data = await res.json();
      // Redirect to Team page.
      navigate(`/teams/team/${data.id}`);
    } else if (res.status === 409) {
      setError('name', { type: 'manual', message: await res.text() });
    } else {
      setSubmissionError('An error occured while attempting to register your team. Please try again.');
    }
  };

  const agencyCodes = useSelector((state) => state.ActivityPage.formCodes?.FundingAgencyCode) ?? [];
  const userAgencies = useSelector((state) => state.Auth?.extendedInfo?.funding_agencies)?.split?.(',');
  const username = useSelector((state) => state.Auth?.username);
  const userIsAdmin = useSelector((state) => state.Auth?.roles.some((r) => r.role_name === Role.MASTER_ADMINISTRATOR));
  const navigate = useNavigate();
  const { createTeam } = useTeamsManagement();
  const [submissionError, setSubmissionError] = useState<string | undefined>();

  const optionsAvailableToUser = useMemo(() => {
    if (userIsAdmin) return agencyCodes;
    return agencyCodes.filter(({ code }) => userAgencies?.includes(code as string));
  }, [agencyCodes, userAgencies, username]);

  const methods = useForm<CreateTeamSchema>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      agencies: []
    }
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = methods;

  return (
    <div id="create-new-team">
      <div className="fixed-back-button">
        <BackButton />
      </div>
      <div className="content">
        <FormProvider {...methods}>
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <hgroup>
              <h1>Register a Team</h1>
              <p>
                Enter your team's details below. This information is private and only visible to current and invited
                members.
              </p>
              <p>As team leader, you can edit members' records that share your team's funding agency.</p>
            </hgroup>
            <Fieldset label={'Team Information'} nested>
              <TextInput
                label={'Team Name'}
                error={get(errors, 'name')}
                required
                width={Width.Half}
                {...register('name', {
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
                tooltip={AGENCY_TOOLTIP}
                width={Width.Half}
                rules={{ validate: (v) => minArrayLength(v, 1), required: true }}
              />
              <TextInput
                error={get(errors, 'description')}
                label={'Team Description'}
                tooltip={DESCRIPTION_TOOLTIP}
                width={Width.Half}
                {...register('description', {
                  validate: (v) => lessThanEqual(v, 256),
                  required: false
                })}
              />
            </Fieldset>
            {submissionError && <p className="deep-red">{submissionError}</p>}
            <Button type="submit" variant="contained" className="create-team-btn">
              Register New Team
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
export default CreateNewTeam;
