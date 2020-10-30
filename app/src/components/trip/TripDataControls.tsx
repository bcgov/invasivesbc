import { Button, makeStyles } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useState, useEffect } from 'react';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { DocType } from 'constants/database';
import { notifySuccess } from 'utils/NotificationUtils';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  controlsGrid: {
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  }
}));

export const TripDataControls: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);
  const [trip, setTrip] = useState(null);
  const api = useInvasivesApi();
  useStyles();

  const getTrip = async () => {
    console.log('trip update in fetch component');
    let docs = await databaseContext.database.find({
      selector: {
        _id: 'trip'
      }
    });
    if (docs.docs.length > 0) {
      let tripDoc = docs.docs[0];
      if (tripDoc) {
        setTrip(tripDoc);
      }
    }
  };
  useEffect(() => {
    const updateComponent = () => {
      getTrip();
    };
    updateComponent();
  }, [databaseChangesContext]);

  const fetchActivities = () => {
    if (trip.activityChoices) {
      trip.activityChoices.map(async (setOfChoices) => {
        let data = await api.getActivities({
          activity_type: setOfChoices.activityType,
          date_range_start: setOfChoices.startDate,
          date_range_end: setOfChoices.endDate,
          search_feature: setOfChoices.geometry[0]
        });
        console.dir(data);
        data.map(async (row) => {
          await databaseContext.database.upsert(DocType.REFERENCE_ACTIVITY + '_' + row.activity_id, (existingDoc) => {
            return { ...existingDoc, docType: DocType.REFERENCE_ACTIVITY, tripID: 'trip', ...row };
          });
        });
        notifySuccess(databaseContext, 'Cached ' + data.length + ' activities.');
      });
    }
  };

  const fetchPointsOfInterest = () => {};

  const deleteTripAndFetch = () => {
    //wipe activities associated to that trip here:
    const deleteOldTrip = () => {};
    deleteOldTrip();

    //fetch what is selected here:
    const fetchNewTrip = () => {
      fetchActivities();
      fetchPointsOfInterest();
    };
    fetchNewTrip();
  };

  return (
    <>
      <Button onClick={deleteTripAndFetch}>Fetch</Button>
    </>
  );
};

export default TripDataControls;
