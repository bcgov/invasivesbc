import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { useSelector } from 'utils/use_selector';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import RecordTable from '../Records/RecordSet/RecordTable/RecordTable';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import './summaryPage.css';

const SummaryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const zones = searchParams.get('zone')?.split(',');

  useEffect(() => {
    setLoading(true);
    void (async () => {
      await fetch(`${API_BASE}/ninja/summary?${searchParams.toString()}`, {
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' }
      })
        .then(async (res) => {
          if (res?.ok) {
            setData(await res.json());
          }
        })
        .catch((e) => console.log('[SummaryPage]:', e))
        .finally(() => setLoading(false));
    })();
  }, [searchParams]);

  if (loading) {
    <div id="summary-page">
      <div className="content">
        <Spinner />
      </div>
    </div>;
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
        <h2>Observations</h2>
        <RecordTable type={'Activity'} data={data?.observations} />
        <h2>Treatments</h2>
        <RecordTable type={'Activity'} data={data?.treatments} />
        <h2>Monitoring</h2>
        <RecordTable type={'Activity'} data={data?.observations} />
        <h2>Biocontrol</h2>
        <RecordTable type={'Activity'} data={data?.biocontrol} />
      </div>
    </div>
  );
};

export default SummaryPage;
