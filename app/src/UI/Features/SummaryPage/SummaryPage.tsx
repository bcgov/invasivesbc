import { useParams, useSearchParams } from 'react-router';

const SummaryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const zones = searchParams.get('zone')?.split(',');
  console.log(zones);

  return (
    <div id="summary-page">
      <div className="content">
        <hgroup>
          <h2>Zone(s) Summary</h2>
          <p>{zones?.join(', ')}</p>
        </hgroup>
      </div>
    </div>
  );
};

export default SummaryPage;
