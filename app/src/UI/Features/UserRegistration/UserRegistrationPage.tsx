import { UserAccessIn } from 'api/api-schema';
import { FormProvider, get, useForm } from 'react-hook-form';
import OverlayContentWrapper from 'UI/Reusable/OverlayContentWrapper/OverlayContentWrapper';
import { useSelector } from 'utils/use_selector';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import TextInput from 'UI/Features//Records/Activity/forms/common/TextInput/TextInput';
import MultiSelect from 'UI/Features//Records/Activity/forms/common/MultiSelect/MultiSelect';
import NumberInput from 'UI/Features//Records/Activity/forms/common/NumberInput/NumberInput';
import { greaterThanEqual, minArrayLength } from '../Records/Activity/forms/common/validators';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import Button from 'UI/Reusable/Button/Button';
import './userRegistrationPage.css';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useDispatch } from 'react-redux';
import Alerts from 'state/actions/alerts/Alerts';
import miscAlertMessages from 'constants/alerts/miscAlerts';

const UpdateGreeting = () => (
  <hgroup>
    <h2>Update Profile</h2>
    <p>
      Please update any necessary fields if they have changed since you submitted your access request. Your information
      will be updated upon review.
    </p>
  </hgroup>
);

const RegisterGreeting = () => (
  <hgroup>
    <h2>Register for InvasivesBC</h2>
    <p>
      The following information is required to properly establish your access to the new InvasivesBC applications. This
      information will not be shared with any other organization within government or externally with other agencies.
    </p>
  </hgroup>
);

const UserRegistrationPage = () => {
  // Form Tooltips
  const TT_AGENCY =
    'Select one or more funding agencies that you collect/provide Invasives content for. May or may not be the same as your employer.';
  const TT_EMPLOYER = 'Who do you work for?';
  const TT_PAC = 'Pesticide Applicator Certificate (PAC) Number';
  const TT_PAC_SERVICE = 'Choose your pesticide use licence';
  const TT_ROLES = 'Select one or more roles to request.';
  const TT_COMMENT = 'If your employer or agency were not on our lists, please enter it here.';

  const submitForm = async (formData: UserAccessIn) => {
    const onFail = () => dispatch(Alerts.create(miscAlertMessages.userRegistrationFailed));
    const onSucess = () => dispatch(Alerts.create(miscAlertMessages.userRegistrationSubmitted));

    await fetch(`${API_V2}/ninja/auth/register`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then((res) => {
        if (res?.ok) onSucess();
        else onFail();
      })
      .catch((e) => {
        console.error(e);
        onFail();
      });
  };

  const dispatch = useDispatch();

  // General User information for default values + display
  const displayName = useSelector((state) => state.Auth?.displayName ?? '');
  const email = useSelector((state) => state.Auth?.email ?? '');
  const pac_number = useSelector((state) => state.Auth?.extendedInfo?.pac_number ?? '');
  const phone = useSelector((state) => state.Auth?.extendedInfo?.work_phone_number ?? '');
  const roles = useSelector((state) => state.Auth.roles ?? []);

  const API_V2 = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const codes = useSelector((state) => state.ActivityPage?.formCodes);

  const methods = useForm<UserAccessIn>({
    mode: 'onChange',
    defaultValues: {
      phone,
      roles: roles.map((r) => r.role_name),
      pac_number: pac_number ? Number.parseInt(pac_number) : NaN,
      pac_service_numbers: []
    }
  });
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = methods;

  const existingUser = roles.length;
  return (
    <OverlayContentWrapper>
      <div id="user-registration">
        {existingUser ? <UpdateGreeting /> : <RegisterGreeting />}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(submitForm)}>
            <Fieldset label="Register" nested>
              {/* For Display Only. Marked required to remove optional flag from input. */}
              <TextInput readOnly required value={displayName} label={'Name'} width={'Half'} />
              <TextInput readOnly required value={email} label={'Email'} width={'Half'} />
              {/* Start of Form Fields */}
              <TextInput
                label="Work Phone"
                error={get(errors, 'phone')}
                {...register('phone', { required: false, maxLength: 128 })}
              />
              <MultiSelect
                label={'Employer(s)'}
                rules={{ validate: (v) => minArrayLength(v, 1), required: true }}
                required
                width={'Half'}
                options={codes?.EmployerCode}
                tooltip={TT_EMPLOYER}
                name="employer"
              />
              <MultiSelect
                label={'Funding Agencies'}
                required
                width={'Half'}
                rules={{ validate: (v) => minArrayLength(v, 1), required: true }}
                options={codes?.FundingAgencyCode}
                tooltip={TT_AGENCY}
                name="funding_agencies"
              />
              <NumberInput
                label={'PAC Number'}
                tooltip={TT_PAC}
                error={get(errors, 'pac_number')}
                {...register('pac_number', {
                  required: false,
                  validate: (v) => greaterThanEqual(v, 0),
                  valueAsNumber: true
                })}
                width="Half"
              />
              <MultiSelect
                label={'Pesticide Service Number(s)'}
                options={codes?.ServiceLicenseNumberAndCompany}
                tooltip={TT_PAC_SERVICE}
                name="pac_service_numbers"
                width="Half"
              />
              <MultiSelect
                label={'Requested Roles'}
                name="roles"
                rules={{ validate: (v) => minArrayLength(v, 1), required: true }}
                options={codes?.Role}
                tooltip={TT_ROLES}
              />
              <TextArea
                label={'Additional Comment(s)'}
                tooltip={TT_COMMENT}
                error={get(errors, 'comments')}
                {...register('comments', { required: false, maxLength: 1048 })}
              />
              <Button type="submit" className="submission-btn">
                Submit
              </Button>
            </Fieldset>
          </form>
        </FormProvider>
      </div>
    </OverlayContentWrapper>
  );
};
export default UserRegistrationPage;
