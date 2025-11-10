import { useEffect, useState } from 'react';
import { useInvasivesApi } from 'hooks/useInvasivesApi';

const useUserAccessReferenceData = () => {
  const [availableRoles, setAvailableRoles] = useState<Record<string, unknown>[]>([]);
  const [agencyCodes, setAgencyCodes] = useState<Record<string, unknown>[]>([]);
  const [employerCodes, setEmployerCodes] = useState<Record<string, unknown>[]>([]);

  const api = useInvasivesApi();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getFundingAgencies().then((res) => {
        const agencies: Record<string, unknown>[] = [];
        for (let i = 0; i < res.length; i++) {
          agencies.push({
            value: res[i].code_name,
            description: res[i].code_description
          });
        }
        setAgencyCodes(agencies);
      }),

      api.getRoles().then((res) => {
        const roles: Record<string, unknown>[] = [];
        for (let i = 0; i < res.length; i++) {
          roles.push({
            id: res[i].role_id,
            name: res[i].role_name,
            description: res[i].role_description
          });
        }
        setAvailableRoles(roles);
      }),

      api.getEmployers().then((res) => {
        const employers: Record<string, unknown>[] = [];
        for (let i = 0; i < res.length; i++) {
          employers.push({
            value: res[i].code_name,
            description: res[i].code_description
          });
        }
        setEmployerCodes(employers);
      })
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  return {
    employerCodes,
    agencyCodes,
    availableRoles,
    loading
  };
};

export default useUserAccessReferenceData;
