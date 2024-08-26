import { Link } from 'react-router-dom';

const NoRowsInSearch = () => (
  <div style={{ color: 'black' }}>
    <p>It seems there are no records to display based on your current settings.</p>
    <p>Verify that the correct record layers are active on your map.</p>
    <Link to="/Records">Go to Records</Link>
  </div>
);

export default NoRowsInSearch;
