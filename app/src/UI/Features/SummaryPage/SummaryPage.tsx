import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useSelector } from 'utils/use_selector';
import RecordTable from 'UI/Features/Records/RecordSet/RecordTable/RecordTable';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { ActivityPlantSummaryOut } from 'api/api-schema';
import ErrorOccurredPage from 'UI/Features/SystemStatusPages/ErrorOccurredPage/ErrorOccurredPage';
import LoadingPage from 'UI/Features/SystemStatusPages/LoadingPage/LoadingPage';
import NotFoundPage from 'UI/Features/SystemStatusPages/NotFoundPage/NotFoundPage';
import './summaryPage.css';

const SummaryPage = () => {
  // Reject any params outside of these options
  const SUPPORTED_PARAMS = ['created_by', 'zone'];

  const queryApi = async () => {
    if (!VALID_REQ) return;
    try {
      const params = new URLSearchParams({ [summaryParam]: queryValue }).toString();
      const res = await fetch(`${API_BASE}/ninja/summary?${params}}`, {
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
      });
      if (res?.ok) setData(await res.json());
    } catch (e) {
      console.log('[SummaryPage]:', e);
    } finally {
      setLoading(false);
    }
  };

  const { summaryParam, queryValue } = useParams();

  const [data, setData] = useState<ActivityPlantSummaryOut>();
  const [loading, setLoading] = useState<boolean>(true);
  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);

  const VALID_REQ = summaryParam && queryValue && SUPPORTED_PARAMS.includes(summaryParam);

  useEffect(() => {
    setLoading(true);
    void (async () => {
      await queryApi();
    })();
  }, [queryValue]);

  if (!VALID_REQ) return <NotFoundPage />;
  if (loading) return <LoadingPage msg={'Building Summary...'} />;
  if (!data) return <ErrorOccurredPage />;
  return (
    <div id="summary-page">
      <div className="back-cont">
        <BackButton />
      </div>
      <div className="content">
        <hgroup>
          <h2>{summaryParam} Summary</h2>
          {/* Remove Underscores and Whitespace from display  */}
          <p className="query">{queryValue?.replace(/[,_]/g, (match) => (match === ',' ? ', ' : ' '))}</p>
        </hgroup>
        <Accordion
          title={<>Observations ({data?.observations?.length ?? 0})</>}
          initState={data?.observations?.length > 0}
        >
          <RecordTable type={'Activity'} data={data?.observations} />
        </Accordion>
        <Accordion title={<>Treatments ({data?.treatments?.length ?? 0})</>} initState={data?.treatments?.length > 0}>
          <RecordTable type={'Activity'} data={data?.treatments} />
        </Accordion>
        <Accordion title={<>Monitoring ({data?.monitoring?.length ?? 0})</>} initState={data?.monitoring?.length > 0}>
          <RecordTable type={'Activity'} data={data?.monitoring} />
        </Accordion>
        <Accordion title={<>Biocontrol ({data?.biocontrol?.length ?? 0})</>} initState={data?.biocontrol?.length > 0}>
          <RecordTable type={'Activity'} data={data?.biocontrol} />
        </Accordion>
      </div>
    </div>
  );
};

export default SummaryPage;
