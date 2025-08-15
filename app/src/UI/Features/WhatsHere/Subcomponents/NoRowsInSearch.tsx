import { LayersClear } from '@mui/icons-material';
import { Link } from 'react-router';
import { useSelector } from 'utils/use_selector';

const NoRowsInSearch = () => {
  const recordSets = useSelector((state) => state.UserSettings.recordSets);
  const noRecordsetsDisplayed = !Object.values(recordSets).some((recordset) => recordset.mapToggle);
  return (
    <div style={{ color: 'black' }}>
      {noRecordsetsDisplayed ? (
        <>
          <p>There are no Recordsets currently visible on the map.</p>
        </>
      ) : (
        <p>There are no points of interest in the selected area.</p>
      )}
      <p>
        To select points of interest on the map, please turn on the visibility of one or more Recordsets by clicking the{' '}
        {<LayersClear />} button.
      </p>
      <Link to="/Records">Go to Records</Link>
    </div>
  );
};

export default NoRowsInSearch;
