import { useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';

const useBugReportPage = () => {
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const BASE = `${API_BASE}/ninja/app_report`;

  /**
   * @desc Fetch all bug reports
   */
  const fetchBugReports = async (): Promise<Response> =>
    await fetch(`${BASE}/bug_report`, {
      method: 'GET',
      headers: {
        Authorization: await getCurrentJWT()
      }
    });

  /**
   * @desc Fetch a specific bug report by ID
   */
  const fetchBugReportById = async (bugReportId: number): Promise<Response> =>
    await fetch(`${BASE}/bug_report/${bugReportId}`, {
      method: 'Get',
      headers: {
        Authorization: await getCurrentJWT()
      }
    });

  return { fetchBugReports, fetchBugReportById };
};

export default useBugReportPage;
