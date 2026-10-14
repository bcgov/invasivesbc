import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useSelector } from 'utils/use_selector';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import RecordTable from '../Records/RecordSet/RecordTable/RecordTable';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import './summaryPage.css';
import { ActivityPlantSummaryOut } from 'api/api-schema';

const SummaryPage = () => {
  const queryApi = async () => {
    try {
      const res = await fetch(`${API_BASE}/ninja/summary?${searchParams.toString()}`, {
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
      });
      if (res?.ok) setData(await res.json());
    } catch (e) {
      console.log('[SummaryPage]:', e);
    } finally {
      setLoading(false);
    }
  };

  const [searchParams] = useSearchParams();
  // TODO: Replace with API Type for Return
  const [data, setData] = useState<ActivityPlantSummaryOut>();
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const zones = searchParams.get('zone')?.split(',');

  useEffect(() => {
    setLoading(true);
    void (async () => {
      await queryApi();
    })();
  }, [searchParams]);

  if (loading) {
    return (
      <div id="summary-page">
        <p>Building Summary...</p>
        <Spinner />
      </div>
    );
  }
  if (!data) {
    return (
      <div id="summary-page">
        <p>An Error Occured. Could not fulfill your request.</p>
      </div>
    );
  }
  return (
    <div id="summary-page">
      <div className="back-cont">
        <BackButton />
      </div>
      <div className="content">
        <hgroup>
          <h2>Zone(s) Summary</h2>
          <p>{zones?.join(', ')}</p>
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
        <Accordion
          title={<>Biocontrol ({data?.biocontrol?.length ?? 0})</>}
          initState={data?.treatments?.biocontrol > 0}
        >
          <RecordTable type={'Activity'} data={data?.biocontrol} />
        </Accordion>
      </div>
    </div>
  );
};

export default SummaryPage;
