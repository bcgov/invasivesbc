import { useFormContext } from 'react-hook-form';
import { FormSchema } from '../interfaces';
import { useSelector } from 'utils/use_selector';
import MultiSelect from '../../common/MultiSelect/MultiSelect';
import tooltips from '../content/tooltips';
import { Width } from '../../common/utils';
import { minArrayLength } from '../../common/validators';
import { useMemo } from 'react';
import { Role } from 'constants/roles';

type PropTypes = {
  width?: Width;
};
/**
 * @desc High order component to control the available Agencies based on the user and form state.
 */
const FundingAgency = ({ width = Width.Full }: PropTypes) => {
  const agencyCodes = useSelector((state) => state.ActivityPage.formCodes?.FundingAgencyCode) ?? [];
  const userAgencies = useSelector((state) => state.Auth?.extendedInfo?.funding_agencies)?.split(',');
  const username = useSelector((state) => state.Auth?.username);
  const userIsAdmin = useSelector((state) => state.Auth?.roles.some((r) => r.role_name === Role.MASTER_ADMINISTRATOR));

  const { watch } = useFormContext<FormSchema>();
  const createdBy = watch('created_by');

  const optionsAvailableToUser = useMemo(() => {
    if (createdBy !== username || userIsAdmin) return agencyCodes;
    return agencyCodes.filter(({ code }) => userAgencies?.includes(code));
  }, [agencyCodes, userAgencies, createdBy, username]);

  return (
    <MultiSelect
      label="Funding Agencies"
      name={'funding_agencies'}
      valueKey={'invasive_species_agency_code'}
      tooltip={tooltips.basic.funding_agencies}
      options={optionsAvailableToUser}
      required
      width={width}
      rules={{ validate: (v) => minArrayLength(v, 1), required: true }}
    />
  );
};

export default FundingAgency;
