import ProtomapsList from 'UI/Features/TileCache/ProtomapsImplementation/ProtomapsList';
import { NavLink } from 'react-router';

import './MapList.css';

const MapList = () => {
  return (
    <div className="trip-module">
      <h2>Offline Maps</h2>
      <p className={'help'}>
        It is not necessary to keep the application open while maps are being prepared by the server.
      </p>
      <ProtomapsList />
    </div>
  );
};

export default MapList;
