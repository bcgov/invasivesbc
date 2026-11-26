import { Divider } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { useSelector } from 'utils/use_selector';
import './bugReportView.css';
import useBugReportPage from 'UI/Features/BugReportPage/bugReportPage.hooks';
import OverlayContentWrapper from 'UI/Reusable/OverlayContentWrapper/OverlayContentWrapper';
import LoadingPage from 'UI/Features/SystemStatusPages/LoadingPage/LoadingPage';

type InfoProps = {
  term: string;
  definition?: string | number | ReactNode;
};
const Info = ({ term, definition }: InfoProps) => {
  if (!definition) return;
  return (
    <div className="list-item" key={term}>
      <dt>{term}:</dt>
      <dd>{definition}</dd>
    </div>
  );
};

// TODO - Add ability to change status of ticket (Closed, Resolved) and view uploaded screenshots/videos
const BugReportView = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [reportDetails, setReportDetails] = useState<Record<string, string> | null>(null);
  const { fetchBugReportById } = useBugReportPage();
  const { id: reportId } = useParams<{ id: string }>();

  const bugIssueTypeCodes = useSelector((state) => state.ActivityPage?.formCodes?.BugReportTypeCode);

  const load = async () => {
    if (!reportId) return;
    setLoading(true);

    try {
      const res = await fetchBugReportById(Number(reportId));
      if (res?.ok) {
        const reports = await res.json();
        const issueType = bugIssueTypeCodes.find((code) => code.code === reports.issue_type)?.full_name;
        reports.issue_type = issueType;
        setReportDetails(reports);
      }
    } catch (e) {
      console.error('Could not fetch bug report details', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [reportId]);

  if (loading || !bugIssueTypeCodes) return <LoadingPage />;

  return (
    <OverlayContentWrapper backButton>
      <div className="bug-report-wrapper">
        <h3 id="form-dialog-title">Bug Report</h3>
        <Divider />
        <div className="bug-report-content">
          <dl>
            <Info term="Title" definition={reportDetails?.title} />
            <Info term="Description" definition={reportDetails?.description} />
            <Info term="Device" definition={reportDetails?.device} />
            <Info term="Reproducible" definition={reportDetails?.reproducible ? 'Yes' : 'No'} />
            <Info term="Expected behavior" definition={reportDetails?.expected_behavior} />
            <Info term="Happening Offline?" definition={reportDetails?.offline ? 'Yes' : 'No'} />
            <Info term="Happening Online?" definition={reportDetails?.online ? 'Yes' : 'No'} />
            <Info term="Issue type" definition={reportDetails?.issue_type} />
          </dl>
        </div>
      </div>
    </OverlayContentWrapper>
  );
};

export default BugReportView;
