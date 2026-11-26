import { CreateBugReportInSchema } from 'api/api-schema';
import { useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';

const useReportBugPage = () => {
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const BASE = `${API_BASE}/ninja/app_report`;

  /**
   * @desc Create a bug report
   */
  const createBugReport = async (data: CreateBugReportInSchema): Promise<Response> =>
    await fetch(`${BASE}/bug_report`, {
      method: 'POST',
      headers: {
        Authorization: await getCurrentJWT(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

  return { createBugReport };
};

export default useReportBugPage;
