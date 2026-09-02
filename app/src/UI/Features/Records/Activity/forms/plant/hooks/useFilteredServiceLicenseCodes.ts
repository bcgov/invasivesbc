import { useMemo } from 'react';
import { Role } from 'constants/roles';
import { useSelector } from 'utils/use_selector';

const useFilteredServiceLicenseCodes = (disabled: boolean) => {
  const NOT_REQUIRED = 'NRQ';
  const codes = useSelector((state) => state.ActivityPage.formCodes?.ServiceLicenseNumberAndCompany);
  const user = useSelector((state) => state.Auth?.extendedInfo);
  const userName = useSelector((state) => state.Auth.username);
  const createdBy = useSelector((state) => state.ActivityPage.formState?.created_by);
  const isUserMasterAdmin = useSelector((state) =>
    state.Auth?.roles.some((r) => r.role_name === Role.MASTER_ADMINISTRATOR)
  );
  // Extract Service License numbers from user info
  const userServiceLicenses = useMemo(() => {
    const licenses: Array<string> = [];
    if (user.pac_service_number_1) licenses.push(user.pac_service_number_1 as string);
    if (user.pac_service_number_2) licenses.push(user.pac_service_number_2 as string);
    return licenses;
  }, [user]);

  // If a non-administrator is creating a form. limit options to only fields they have assigned to their profile.
  const filteredCodes = useMemo(() => {
    if (createdBy === userName && !isUserMasterAdmin && !disabled) {
      return codes.filter(({ code }) => userServiceLicenses.includes(code as string) || code === NOT_REQUIRED);
    }
    return codes;
  }, [codes, userServiceLicenses, createdBy, isUserMasterAdmin, userName, disabled]);

  return { serviceLicenseCodes: filteredCodes };
};

export default useFilteredServiceLicenseCodes;
