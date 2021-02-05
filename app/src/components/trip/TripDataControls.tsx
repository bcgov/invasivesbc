import { Button, makeStyles } from '@material-ui/core';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import {
  IActivitySearchCriteria,
  IPointOfInterestSearchCriteria,
  IMetabaseQuerySearchCriteria
} from 'interfaces/useInvasivesApi-interfaces';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { notifySuccess } from 'utils/NotificationUtils';

const useStyles = makeStyles((theme) => ({
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

export const TripDataControls: React.FC = (props) => {
  useStyles();

  const invasivesApi = useInvasivesApi();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [trip, setTrip] = useState(null);

  const getTrip = useCallback(async () => {
    let docs = await databaseContext.database.find({ selector: { _id: 'trip' } });

    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }

    setTrip(docs.docs[0]);
  }, [databaseContext.database]);

  useEffect(() => {
    const updateComponent = () => {
      getTrip();
    };

    updateComponent();
  }, [databaseChangesContext, getTrip]);

  const fetchActivities = async () => {
    if (!trip || !trip.activityChoices) {
      return;
    }

    let numberActivitiesFetched = 0;

    for (const setOfChoices of trip.activityChoices) {
      const geometry = (trip.geometry && trip.geometry.length && trip.geometry[0]) || null;

      const activitySearchCriteria: IActivitySearchCriteria = {
        ...((setOfChoices.activityType && { activity_type: [setOfChoices.activityType] }) || []),
        ...((setOfChoices.startDate && { date_range_start: setOfChoices.startDate }) || {}),
        ...((setOfChoices.endDate && { date_range_end: setOfChoices.endDate }) || {}),
        ...((geometry && { search_feature: geometry }) || {})
      };

      let response = await invasivesApi.getActivities(activitySearchCriteria);

      for (const row of response.rows) {
        const photos = [];

        if (setOfChoices.includePhotos && row.media_keys && row.media_keys.length) {
          try {
            const mediaResults = await invasivesApi.getMedia(row.media_keys);

            mediaResults.forEach((media) => {
              photos.push({ filepath: media.file_name, dataUrl: media.encoded_file });
            });
          } catch {
            // TODO handle errors appropriately
          }
        }

        try {
          await databaseContext.database.upsert(row.activity_id, (existingDoc) => {
            return {
              ...existingDoc,
              docType: DocType.REFERENCE_ACTIVITY,
              tripID: 'trip',
              ...row,
              formData: row.activity_payload.form_data,
              activityType: row.activity_type,
              activitySubtype: row.activity_subtype,
              geometry: row.activity_payload.geometry,
              photos: photos
            };
          });

          numberActivitiesFetched++;
        } catch (error) {
          // TODO handle errors appropriately
        }
      }
    }

    notifySuccess(databaseContext, 'Cached ' + numberActivitiesFetched + ' activities.');
  };

  const fetchPointsOfInterest = async () => {
    if (!trip || !trip.pointOfInterestChoices) {
      return;
    }

    let numberPointsOfInterestFetched = 0;

    for (const setOfChoices of trip.pointOfInterestChoices) {
      const geometry = (trip.geometry && trip.geometry.length && trip.geometry[0]) || null;

      const pointOfInterestSearchCriteria: IPointOfInterestSearchCriteria = {
        ...((setOfChoices.pointOfInterestType && { point_of_interest_type: setOfChoices.pointOfInterestType }) || {}),
        ...((setOfChoices.startDate && { date_range_start: setOfChoices.startDate }) || {}),
        ...((setOfChoices.endDate && { date_range_end: setOfChoices.endDate }) || {}),
        ...((geometry && { search_feature: geometry }) || {})
      };

      let response = await invasivesApi.getPointsOfInterest(pointOfInterestSearchCriteria);

      for (const row of response) {
        const photos = [];

        if (setOfChoices.includePhotos && row.media_keys && row.media_keys.length) {
          try {
            const mediaResults = await invasivesApi.getMedia(row.media_keys);

            mediaResults.forEach((media) => {
              photos.push({ filepath: media.file_name, dataUrl: media.encoded_file });
            });
          } catch {
            // TODO handle errors appropriately
          }
        }

        try {
          await databaseContext.database.upsert('POI' + row.point_of_interest_id, (existingDoc) => {
            return {
              ...existingDoc,
              docType: DocType.REFERENCE_POINT_OF_INTEREST,
              tripID: 'trip',
              ...row,
              formData: row.point_of_interest_payload.form_data,
              pointOfInterestType: row.point_of_interest_type,
              pointOfInterestSubtype: row.point_of_interest_subtype,
              geometry: [...row.point_of_interest_payload.geometry],
              photos: photos
            };
          });

          numberPointsOfInterestFetched++;
        } catch (error) {
          // TODO handle errors appropriately
        }
      }
    }
    notifySuccess(databaseContext, 'Cached ' + numberPointsOfInterestFetched + ' points of interest.');
  };

  const fetchMetabaseQueries = async () => {
    if (!trip || !trip.metabaseChoices) {
      return;
    }

    let countActivities = 0;
    let countPois = 0;

    for (const setOfChoices of trip.metabaseChoices) {
      const geometry = (trip.geometry && trip.geometry.length && trip.geometry[0]) || null;

      const querySearchCriteria: IMetabaseQuerySearchCriteria = {
        ...((setOfChoices.metabaseQueryId && { metabaseQueryId: setOfChoices.metabaseQueryId }) || {}),
        ...((geometry && { search_feature: geometry }) || {})
      };

      let response = await invasivesApi.getMetabaseQueryResults(querySearchCriteria);

      let responseRows = [];
      if (response?.activities?.length) responseRows = response.activities;
      if (response?.points_of_interest?.length) responseRows = [responseRows, ...response.points_of_interest];
      for (const row of responseRows) {
        const photos = [];

        if (setOfChoices.includePhotos && row.media_keys && row.media_keys.length) {
          try {
            const mediaResults = await invasivesApi.getMedia(row.media_keys);

            mediaResults.forEach((media) => {
              photos.push({ filepath: media.file_name, dataUrl: media.encoded_file });
            });
          } catch {
            // TODO handle errors appropriately
          }
        }

        try {
          if (row.activity_id) {
            await databaseContext.database.upsert(row.activity_id, (existingDoc) => {
              return {
                ...existingDoc,
                docType: DocType.REFERENCE_ACTIVITY,
                tripID: 'trip',
                ...row,
                formData: row.activity_payload.form_data,
                activityType: row.activity_type,
                activitySubtype: row.activity_subtype,
                geometry: row.activity_payload.geometry,
                photos: photos
              };
            });
            countActivities++;
          }

          if (row.point_of_interest_id) {
            await databaseContext.database.upsert('POI' + row.point_of_interest_id, (existingDoc) => {
              return {
                ...existingDoc,
                docType: DocType.REFERENCE_POINT_OF_INTEREST,
                tripID: 'trip',
                ...row,
                formData: row.point_of_interest_payload.form_data,
                pointOfInterestType: row.point_of_interest_type,
                pointOfInterestSubtype: row.point_of_interest_subtype,
                geometry: [...row.point_of_interest_payload.geometry],
                photos: photos
              };
            });
            countPois++;
          }
        } catch (error) {
          // TODO handle errors appropriately
        }
      }
    }

    notifySuccess(
      databaseContext,
      'Cached ' +
        (countActivities ? countActivities + ' activities' : '') +
        (countActivities && countPois ? ' and ' : '') +
        (countPois ? countPois + ' points of interest' : '') +
        (countActivities || countPois ? ' from Metabase.' : '0 Metabase results.')
    );
  };

  const deleteTripAndFetch = () => {
    //wipe activities associated to that trip here:
    const deleteOldTrip = () => {};
    deleteOldTrip();

    //fetch what is selected here:
    const fetchNewTrip = () => {
      fetchActivities();
      fetchPointsOfInterest();
      fetchMetabaseQueries();
    };
    fetchNewTrip();
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={deleteTripAndFetch}>
        Fetch
      </Button>
    </>
  );
};

export default TripDataControls;
