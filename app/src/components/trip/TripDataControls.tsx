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
        console.log('set of choices');
        console.dir(setOfChoices);
        let geo = () => {
          let aGeo = null;
          if (trip.geometry) {
            aGeo = trip.geometry.length > 0 ? trip.geometry[0] : null;
          }
          return aGeo;
        };

        let data = geo()
          ? await api.getActivities({
              activity_type: setOfChoices.activityType,
              date_range_start: setOfChoices.startDate,
              date_range_end: setOfChoices.endDate //,
              // search_feature: trip.geometry[0]
            })
          : await api.getActivities({
              activity_type: setOfChoices.activityType,
              date_range_start: setOfChoices.startDate,
              date_range_end: setOfChoices.endDate
            });
        console.dir(data);
        data.map(async (row) => {
          await databaseContext.database.upsert(DocType.REFERENCE_ACTIVITY + '_' + row.activity_id, (existingDoc) => {
            return {
              ...existingDoc,
              docType: DocType.REFERENCE_ACTIVITY,
              tripID: 'trip',
              ...row,
              formData: row.activity_payload.form_data,
              activityType: row.activity_type,
              activitySubtype: row.activity_subtype,
              geometry: row.activity_payload.geometry,
              photos: row.activity_payload.media
            };
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
