import { Capacitor } from '@capacitor/core';
import { Button, makeStyles } from '@material-ui/core';
import Spinner from 'components/spinner/Spinner';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import {
  IActivitySearchCriteria,
  IPointOfInterestSearchCriteria,
  IMetabaseQuerySearchCriteria
} from 'interfaces/useInvasivesApi-interfaces';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';

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

export const TripDataControls: React.FC<any> = (props) => {
  useStyles();

  const invasivesApi = useInvasivesApi();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [trip, setTrip] = useState(null);
  const [fetching, setFetching] = useState(false);

  const bulkUpsert = async (upserts) => {
    let allDocsFetch = await databaseContext.database.allDocs({ include_docs: true });
    let allDocs = allDocsFetch?.rows ? allDocsFetch.rows : [];

    const newUpserts = { ...upserts };

    // go through all docs, flagging those already existing:
    const modifiedDocs = allDocs
      .filter((doc) => {
        const id = doc.doc?._id;
        newUpserts[id] = undefined; // remove found docs*/ // does this not block updates?
        return upserts[id];
      })
      .map((doc) => {
        return upserts[doc.id](doc.doc);
      });

    const newDocs = Object.keys(newUpserts)
      .filter((id) => newUpserts[id] !== undefined)
      .map((id) => upserts[id]());

    const resultDocs = [...modifiedDocs, ...newDocs];
    resultDocs.sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });

    await databaseContext.database.bulkDocs(resultDocs);

    return Object.keys(upserts).length;
  };

  const getPhotos = async (row) => {
    const photos = [];
    if (row.media_keys && row.media_keys.length) {
      try {
        const mediaResults = await invasivesApi.getMedia(row.media_keys);

        mediaResults.forEach((media) => {
          photos.push({ filepath: media.file_name, dataUrl: media.encoded_file });
        });
      } catch {
        alert('Could not fetch photos for ' + row._id);
        //notifyError(databaseContext, 'Could not fetch photos for ' + row._id);
      }
      return photos;
    }
    return [];
  };

  const getTrip = useCallback(async () => {
    //legacy pouch:
    if (Capacitor.getPlatform() == 'web') {
      let docs = await databaseContext.database.find({
        selector: {
          _id: props.trip_ID,
          docType: DocType.TRIP
        }
      });

      if (!docs || !docs.docs || !docs.docs.length) return;

      setTrip(docs.docs[0]);
    }
    //sqlite mobile
    else {
      let queryResults = await query(
        { type: QueryType.DOC_TYPE_AND_ID, ID: props.trip_ID, docType: DocType.TRIP },
        databaseContext
      );
      setTrip(JSON.parse(queryResults[0].json));
    }
  }, [databaseContext.database]);

  useEffect(() => {
    const updateComponent = () => {
      getTrip();
    };

    updateComponent();
  }, [databaseChangesContext, getTrip]);

  const fetchActivities = async () => {
    if (!trip || !trip.activityChoices || !trip.activityChoices.length) {
      return;
    }

    let numberActivitiesFetched = 0;

    for (const setOfChoices of trip.activityChoices) {
      const geometry = (trip.geometry && trip.geometry.length && trip.geometry[0]) || null;

      // a comment would be great here
      const activitySearchCriteria: IActivitySearchCriteria = {
        ...((setOfChoices.activityType && { activity_type: [setOfChoices.activityType] }) || []),
        ...((setOfChoices.startDate && { date_range_start: setOfChoices.startDate }) || {}),
        ...((setOfChoices.endDate && { date_range_end: setOfChoices.endDate }) || {}),
        ...((geometry && { search_feature: geometry }) || {})
      };

      let response = await invasivesApi.getActivities(activitySearchCriteria);

      let upserts = [];

      for (const row of response.rows) {
        let photos = [];
        if (setOfChoices.includePhotos) photos = await getPhotos(row);

        if (Capacitor.getPlatform() == 'web') {
          upserts = {
            ...upserts,
            [row.activity_id]: (existingDoc: any) => ({
              ...existingDoc,
              _id: row.activity_id,
              docType: DocType.REFERENCE_ACTIVITY,
              trip_IDs: existingDoc?.trip_IDs ? [...existingDoc.trip_IDs, props.trip_ID] : [props.trip_ID],
              ...row,
              formData: row.activity_payload.form_data,
              activityType: row.activity_type,
              activitySubtype: row.activity_subtype,
              geometry: row.activity_payload.geometry,
              photos: photos
            })
          };
        } else {
          let jsonObj = {
            id: row.activity_id,
            docType: DocType.REFERENCE_ACTIVITY,
            ...row,
            formData: row.activity_payload.form_data,
            activityType: row.activity_type,
            activitySubtype: row.activity_subtype,
            geometry: row.activity_payload.geometry,
            photos: photos
          };

          upserts.push({
            docType: DocType.REFERENCE_ACTIVITY,
            ID: row.activity_id,
            type: UpsertType.DOC_TYPE_AND_ID,
            json: jsonObj
          });
        }
      }
      try {
        if (Capacitor.getPlatform() == 'web') {
          numberActivitiesFetched += await bulkUpsert(upserts);
        } else {
          numberActivitiesFetched += await upsert(upserts, databaseContext);
          alert('Cached ' + numberActivitiesFetched + ' activities.');
        }
      } catch (error) {
        alert('There was an error: ' + error);
        // notifyError(databaseContext, 'Error with inserting Activities into database: ' + error);
      }
    }
    alert('Fetched ' + numberActivitiesFetched + ' activities.');
    // notifySuccess(databaseContext, 'Cached ' + numberActivitiesFetched + ' activities.');
  };

  const fetchPointsOfInterest = async () => {
    console.log('input valid');
    if (!trip || !trip.pointOfInterestChoices || !trip.pointOfInterestChoices.length) {
      return;
    }
    console.log('made it past input valid');

    let numberPointsOfInterestFetched = 0;

    for (const setOfChoices of trip.pointOfInterestChoices) {
      const geometry = (trip.geometry && trip.geometry.length && trip.geometry[0]) || null;

      let pointOfInterestSearchCriteria: IPointOfInterestSearchCriteria = {
        ...((setOfChoices.pointOfInterestType && { point_of_interest_type: setOfChoices.pointOfInterestType }) || {}),
        ...((setOfChoices.iappType && { iappType: setOfChoices.iappType }) || {}),
        ...((setOfChoices.startDate && { date_range_start: setOfChoices.startDate }) || {}),
        ...((setOfChoices.endDate && { date_range_end: setOfChoices.endDate }) || {}),
        ...((geometry && { search_feature: geometry }) || {}),
        limit: 1000,
        page: 1
      };
      console.log('checking...');
      console.log(pointOfInterestSearchCriteria);
      let response: any;
      console.log('*** fetching points of interest ***');
      try {
        response = await invasivesApi.getPointsOfInterest(pointOfInterestSearchCriteria);
      } catch (e) {
        console.log('crashed on fetching points of interest');
        console.log(e);
      }
      console.log('response.count: ' + response.count);
      console.log('response.rows.length: ' + response.rows.length);
      console.log('*** building upsert configs ***');

      if (response == undefined) {
        console.log('response is undefined');
      }

      let total_to_fetch = response.count;
      console.log('*** total points of interest to get:  ' + response.count);
      while (numberPointsOfInterestFetched !== total_to_fetch) {
        if (pointOfInterestSearchCriteria.page != 1) {
          try {
            response = await invasivesApi.getPointsOfInterest(pointOfInterestSearchCriteria);
          } catch (e) {
            console.log('crashed on fetching points of interest');
            console.log(e);
          }
        }
        let upserts = [];
        for (const row of response.rows) {
          let photos = [];
          if (setOfChoices.includePhotos) photos = await getPhotos(row);
          let jsonObj = {
            _id: row.point_of_interest_id,
            docType: DocType.REFERENCE_POINT_OF_INTEREST,
            ...row,
            formData: row.point_of_interest_payload.form_data,
            pointOfInterestType: row.point_of_interest_type,
            pointOfInterestSubtype: row.point_of_interest_subtype,
            geometry: [...row.point_of_interest_payload.geometry],
            photos: photos
          };
          upserts.push({
            docType: DocType.REFERENCE_POINT_OF_INTEREST,
            ID: row.point_of_interest_id,
            type: UpsertType.DOC_TYPE_AND_ID,
            json: jsonObj
          });
        }
      }
      numberPointsOfInterestFetched += response.rows.length;
      pointOfInterestSearchCriteria.page += 1;
    }
    alert('Cached ' + numberPointsOfInterestFetched + ' points of interest.');
    //notifySuccess(databaseContext, 'Cached ' + numberPointsOfInterestFetched + ' points of interest.');
  };

  const fetchMetabaseQueries = async () => {
    if (!trip || !trip.metabaseChoices || !trip.metabaseChoices.length) {
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

      if (!setOfChoices.metabaseQueryId) {
        //notifyError(databaseContext, 'Metabase Query ID cannot be blank, please select a query');
        alert('Metabase Query ID cannot be blank, please select a query');
        return;
      }

      let response = await invasivesApi.getMetabaseQueryResults(querySearchCriteria);

      await databaseContext.database.upsert(props.trip_ID, (tripDoc) => ({
        ...tripDoc,
        metabaseQueryNames: {
          ...trip.metabaseQueryNames,
          [setOfChoices.metabaseQueryId]: response.name
        }
      }));

      let responseRows = [];
      if (response?.activities?.length) responseRows = response.activities;
      if (response?.points_of_interest?.length) responseRows = [responseRows, ...response.points_of_interest];

      let upserts = {};
      for (const row of responseRows) {
        let photos = [];
        if (setOfChoices.includePhotos) photos = await getPhotos(row);

        if (row.activity_id) {
          upserts = {
            ...upserts,
            [row.activity_id]: (existingDoc: any) => ({
              ...existingDoc,
              _id: row.activity_id,
              docType: DocType.REFERENCE_ACTIVITY,
              trip_IDs:
                existingDoc && existingDoc.trip_IDs ? [...existingDoc.trip_IDs, props.trip_ID] : [props.trip_ID],
              ...row,
              formData: row.activity_payload.form_data,
              activityType: row.activity_type,
              activitySubtype: row.activity_subtype,
              geometry: row.activity_payload.geometry,
              photos
            })
          };
          countActivities++;
        }

        if (row.point_of_interest_id) {
          upserts = {
            ...upserts,
            ['POI' + row.point_of_interest_id]: (existingDoc: any) => ({
              ...existingDoc,
              _id: 'POI' + row.point_of_interest_id,
              docType: DocType.REFERENCE_POINT_OF_INTEREST,
              trip_IDs:
                existingDoc && existingDoc.trip_IDs ? [...existingDoc.trip_IDs, props.trip_ID] : [props.trip_ID],
              ...row,
              formData: row.point_of_interest_payload.form_data,
              pointOfInterestType: row.point_of_interest_type,
              pointOfInterestSubtype: row.point_of_interest_subtype,
              geometry: [...row.point_of_interest_payload.geometry],
              photos
            })
          };
          countPois++;
        }
      }
      try {
        await bulkUpsert(upserts);
      } catch (error) {
        //notifyError(databaseContext, 'Error with inserting Metabase results into database: ' + error);
        alert('Error with inserting Metabase results into database: ' + error);
      }
    }
    alert(
      'Cached ' +
        (countActivities ? countActivities + ' activities' : '') +
        (countActivities && countPois ? ' and ' : '') +
        (countPois ? countPois + ' points of interest' : '') +
        (countActivities || countPois ? ' from Metabase.' : '0 Metabase results.')
    );
    // notifySuccess(
    //   databaseContext,
    //   'Cached ' +
    //     (countActivities ? countActivities + ' activities' : '') +
    //     (countActivities && countPois ? ' and ' : '') +
    //     (countPois ? countPois + ' points of interest' : '') +
    //     (countActivities || countPois ? ' from Metabase.' : '0 Metabase results.')
    // );
  };

  const deleteTripAndFetch = async () => {
    //wipe activities associated to that trip here:
    const deleteOldTrip = () => {};
    //todo:
    deleteOldTrip();

    //fetch what is selected here:
    await setFetching(true);
    console.log('about to fetch stuf');
    Promise.all([fetchActivities(), fetchPointsOfInterest(), fetchMetabaseQueries()])
      .finally(() => setFetching(false))
      .catch((error) => {
        setFetching(false);
        //notifyError(databaseContext, 'Error when fetching from network: ' + error);
      });
  };

  return (
    <>
      <Button variant="contained" color="primary" disabled={fetching} onClick={deleteTripAndFetch}>
        {fetching ? <Spinner /> : 'Cache Trip For Offline'}
      </Button>
    </>
  );
};

export default TripDataControls;
