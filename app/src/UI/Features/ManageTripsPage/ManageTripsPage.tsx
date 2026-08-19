import { useState } from 'react';
import './manageTripsPage.css';
import { ArrowBackIos } from '@mui/icons-material';
import PlanMyTripForm from './subcomponents/PlanMyTripForm/PlanMyTripForm';
import ManageMyTrips from './subcomponents/ManageMyTrips/ManageMyTrips';
import Button from 'UI/Reusable/Button/Button';

const ManageTripsPage = () => {
  enum Mode {
    CREATE,
    MAIN,
    MANAGE
  }
  const [mode, setMode] = useState<Mode>(Mode.MAIN);

  return (
    <div id="manage-trips">
      {mode !== Mode.MAIN && (
        <div className="trip-header">
          <Button onClick={setMode.bind(this, Mode.MAIN)} variant="none">
            <ArrowBackIos /> Back
          </Button>
        </div>
      )}
      <div className="content">
        {
          {
            [Mode.MAIN]: (
              <div className="main">
                <p>I'm Looking To...</p>
                <Button variant="contained" size="lg" onClick={setMode.bind(this, Mode.CREATE)}>
                  Plan a New Trip
                </Button>
                <Button variant="contained" size="lg" onClick={setMode.bind(this, Mode.MANAGE)}>
                  Manage My Trips
                </Button>
              </div>
            ),
            [Mode.CREATE]: (
              <div>
                <PlanMyTripForm />
                <div className="redirect">
                  <p>Looking for an existing trip?</p>
                  <Button onClick={setMode.bind(this, Mode.MANAGE)}>Manage My Trips</Button>
                </div>
              </div>
            ),
            [Mode.MANAGE]: (
              <div>
                <ManageMyTrips />
                <div className="redirect">
                  <p>Not seeing what you're looking for?</p>
                  <Button size="sm" onClick={setMode.bind(this, Mode.CREATE)}>
                    Plan a New Trip
                  </Button>
                </div>
              </div>
            )
          }[mode]
        }
      </div>
    </div>
  );
};

export default ManageTripsPage;
