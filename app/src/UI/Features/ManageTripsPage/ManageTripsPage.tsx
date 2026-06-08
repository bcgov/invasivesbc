import './manageTripsPage.css';
import TripForm from 'UI/Features/ManageTripsPage/subcomponents/TripForm/TripForm';
import TripList from 'UI/Features/ManageTripsPage/subcomponents/TripList/TripList';
import MapList from 'UI/Features/ManageTripsPage/subcomponents/MapList/MapList';

import { NavLink, Route, Routes, useLocation, useMatch } from 'react-router';
import { ArrowBackIos, FiberNewSharp, TripOrigin, DownloadOutlined } from '@mui/icons-material';

const ManageTripsPage = () => {
  const atRoot = useMatch('/ManageTrips/') !== null;

  return (
    <div id="manage-trips">
      <div className={`navigation ${atRoot ? 'expanded' : 'collapsed'}`}>
        {atRoot || (
          <>
            <NavLink to={'/ManageTrips'} className={'back'}>
              <ArrowBackIos />
              Back To Manage My Trips
            </NavLink>
          </>
        )}

        <>
          <NavLink to={'/ManageTrips/new'}>
            <FiberNewSharp />
            Plan a New Trip
          </NavLink>
          <NavLink to={'/ManageTrips/trips'}>
            <TripOrigin />
            Manage My Trips
          </NavLink>
          <NavLink to={'/ManageTrips/maps'}>
            <DownloadOutlined />
            Offline Maps
          </NavLink>
        </>
      </div>

      <div className={'content'}>
        <Routes>
          <Route path={'/new'} element={<TripForm />}></Route>
          <Route path={'/trips'} element={<TripList />}></Route>
          <Route path={'/maps'} element={<MapList />}></Route>
        </Routes>
      </div>
    </div>
  );
};

export default ManageTripsPage;
