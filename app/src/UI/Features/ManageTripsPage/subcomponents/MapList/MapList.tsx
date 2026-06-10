import ProtomapsList from 'UI/Features/TileCache/ProtomapsImplementation/ProtomapsList';
import { NavLink } from 'react-router';

import './MapList.css';

const MapList = () => {
  return (
    <div className="trip-module">
      <h2>Offline Maps</h2>
      <p className={'help'}>
        Closing the app won't stop your progress. Maps will download automatically once prepared, or you can manually
        start them whenever you return.
      </p>
      <ProtomapsList />
    </div>
  );
};

export default MapList;
