import { useFormContext } from 'react-hook-form';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useSelector } from 'utils/use_selector';
import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { useMemo } from 'react';
import { Role } from 'constants/roles';
import { minArrayLength } from 'UI/Features/Records/Activity/forms/common/validators';

type PropTypes = {
  width?: Width;
};
/**
 * @desc High order component to control the available employers based on the user and form state.
 */
const Employer = ({ width = Width.Full }: PropTypes) => {
  const NOT_REQUIRED = 'NRQ';
  const employerCodes = useSelector((state) => state.ActivityPage.formCodes?.EmployerCode) ?? [];
  const userEmployers = useSelector((state) => state.Auth?.extendedInfo?.employer)?.split(',');
  const username = useSelector((state) => state.Auth?.username);
  const userIsAdmin = useSelector((state) => state.Auth?.roles.some((r) => r.role_name === Role.MASTER_ADMINISTRATOR));

  const { watch } = useFormContext<FormSchema>();
  const createdBy = watch('created_by');

  const optionsAvailableToUser = useMemo(() => {
    if (createdBy !== username || userIsAdmin) return employerCodes;
    return employerCodes.filter(({ code }) => userEmployers?.includes(code as string) || code === NOT_REQUIRED);
  }, [employerCodes, userEmployers, createdBy, username]);

  return (
    <MultiSelect
      label={'Employer'}
      valueKey="employer"
      options={optionsAvailableToUser}
      name={'employer'}
      required
      tooltip={tooltips.basic.employer}
      rules={{ required: true, validate: (val) => minArrayLength(val, 1) }}
      width={width}
    />
  );
};

export default Employer;
