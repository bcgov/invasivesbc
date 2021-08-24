import { Box, Button, LinearProgress, makeStyles, Typography } from '@material-ui/core';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from '../../contexts/DatabaseChangesContext';
import { DatabaseContext2, query, QueryType, upsert, UpsertType } from '../../contexts/DatabaseContext2';
import { FeatureCollection } from 'geojson';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import * as turf from '@turf/turf';
import {
  IActivitySearchCriteria,
  IPointOfInterestSearchCriteria,
  IMetabaseQuerySearchCriteria
} from '../../interfaces/useInvasivesApi-interfaces';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AllGeoJSON } from '@turf/turf';
import { getDataFromDataBC } from 'components/map/WFSConsumer';

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

  const databaseContext = useContext(DatabaseContext2);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [trip, setTrip] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetch, setFetch] = useState(false);
  const [totalRecordsToFetch, setTotalRecordsToFetch] = useState(0);
  const [totalRecordsFetched, setTotalRecordsFetched] = useState(0);

  // const bulkUpsert = async (upserts) => {
  //   let allDocsFetch = await databaseContext.database.allDocs({ include_docs: true });
  //   let allDocs = allDocsFetch?.rows ? allDocsFetch.rows : [];

  //   const newUpserts = { ...upserts };

  //   // go through all docs, flagging those already existing:
  //   const modifiedDocs = allDocs
  //     .filter((doc) => {
  //       const id = doc.doc?._id;
  //       newUpserts[id] = undefined; // remove found docs*/ // does this not block updates?
  //       return upserts[id];
  //     })
  //     .map((doc) => {
  //       return upserts[doc.id](doc.doc);
  //     });

  //   const newDocs = Object.keys(newUpserts)
  //     .filter((id) => newUpserts[id] !== undefined)
  //     .map((id) => upserts[id]());

  //   const resultDocs = [...modifiedDocs, ...newDocs];
  //   resultDocs.sort((a, b) => {
  //     if (a.id < b.id) return -1;
  //     if (a.id > b.id) return 1;
  //     return 0;
  //   });

  //   await databaseContext.database.bulkDocs(resultDocs);

  //   return Object.keys(upserts).length;
  // };

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
      }
      return photos;
    }
    return [];
  };

  const getTrip = useCallback(async () => {
    const queryResults = await query(
      { type: QueryType.DOC_TYPE_AND_ID, ID: props.trip_ID, docType: DocType.TRIP },
      databaseContext
    );
    setTrip(JSON.parse(queryResults[0].json));
  }, [databaseContext]);

  useEffect(() => {
    const updateComponent = () => {
      getTrip();
    };

    updateComponent();
  }, [databaseChangesContext, getTrip]);

  useEffect(() => {
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

        const response = await invasivesApi.getActivities(activitySearchCriteria);

        const upserts = [];

        for (const row of response.rows) {
          let photos = [];
          if (setOfChoices.includePhotos) {
            photos = await getPhotos(row);
          }

          const jsonObj = {
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
        try {
          numberActivitiesFetched += await upsert(upserts, databaseContext);
          alert(`Cached ${numberActivitiesFetched} activities.`);
        } catch (error) {
          alert('Error with inserting Activities into database: ' + error);
        }
      }
      alert(`Cached ${numberActivitiesFetched}activities.`);
    };

    const fetchPointsOfInterest = async () => {
      console.log('input valid');
      if (!trip || !trip.pointOfInterestChoices || !trip.pointOfInterestChoices.length) {
        return;
      }
      console.log('made it past input valid');

      let numberPointsOfInterestFetched = 0;

      for (const setOfChoices of trip.pointOfInterestChoices) {
        if (!fetch) {
          return;
        }
        const geometry = (trip.geometry && trip.geometry.length && trip.geometry[0]) || null;

        const pointOfInterestSearchCriteria: IPointOfInterestSearchCriteria = {
          ...((setOfChoices.pointOfInterestType && { point_of_interest_type: setOfChoices.pointOfInterestType }) || {}),
          ...((setOfChoices.iappType && { iappType: setOfChoices.iappType }) || {}),
          ...((setOfChoices.iappSiteID && { iappSiteID: setOfChoices.iappSiteID }) || {}),
          ...((setOfChoices.startDate && { date_range_start: setOfChoices.startDate }) || {}),
          ...((setOfChoices.endDate && { date_range_end: setOfChoices.endDate }) || {}),
          ...((geometry && { search_feature: geometry }) || {}),
          limit: 1000,
          page: 0
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

        const totalToFetch = response.count;
        setTotalRecordsToFetch(totalToFetch);
        console.log('*** total points of interest to get:  ' + response.count);
        while (numberPointsOfInterestFetched !== totalToFetch) {
          if (!fetch) {
            return;
          }
          if (pointOfInterestSearchCriteria.page !== 0) {
            try {
              response = await invasivesApi.getPointsOfInterest(pointOfInterestSearchCriteria);
            } catch (e) {
              console.log('crashed on fetching points of interest');
              console.log(e);
            }
          }
          const upserts = [];
          for (const row of response.rows) {
            let photos = [];
            if (setOfChoices.includePhotos) {
              photos = await getPhotos(row);
            }
            const jsonObj = {
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
          numberPointsOfInterestFetched += response.rows.length;
          setTotalRecordsFetched(numberPointsOfInterestFetched);
          console.log('*** total points of interest fetched:  ' + numberPointsOfInterestFetched);
          console.log('*** total points of interest to get:  ' + totalToFetch);
          pointOfInterestSearchCriteria.page += 1;
          console.log(pointOfInterestSearchCriteria);
        }
      }
      alert(`Cached ${numberPointsOfInterestFetched} points of interest.`);
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
          alert('Metabase Query ID cannot be blank, please select a query');
          return;
        }

        const response = await invasivesApi.getMetabaseQueryResults(querySearchCriteria);

        await upsert(
          [
            {
              type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
              docType: DocType.TRIP,
              ID: props.trip_ID,
              json: {
                metabaseQueryNames: {
                  ...trip.metabaseQueryNames,
                  [setOfChoices.metabaseQueryId]: response.name
                }
              }
            }
          ],
          databaseContext
        );

        let responseRows = [];
        if (response?.activities?.length) {
          responseRows = response.activities;
        }
        if (response?.points_of_interest?.length) {
          responseRows = [responseRows, ...response.points_of_interest];
        }

        let upserts = {};
        for (const row of responseRows) {
          let photos = [];
          if (setOfChoices.includePhotos) {
            photos = await getPhotos(row);
          }

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
          // await bulkUpsert(upserts);
        } catch (error) {
          alert(`Error with inserting Metabase results into database: ${error}`);
        }
      }
      alert(
        'Cached ' +
          (countActivities ? countActivities + ' activities' : '') +
          (countActivities && countPois ? ' and ' : '') +
          (countPois ? countPois + ' points of interest' : '') +
          (countActivities || countPois ? ' from Metabase.' : '0 Metabase results.')
      );
    };

    const fetchLayerData = async () => {
      const vanIsland: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-123.74656677246092, 48.61838518688487],
                  [-123.37783813476564, 48.61838518688487],
                  [-123.37783813476564, 48.84076881182656],
                  [-123.74656677246092, 48.84076881182656],
                  [-123.74656677246092, 48.61838518688487]
                ]
              ]
            }
          }
        ]
      };

      // try {
      const options = { units: 'miles' };

      const bbox = turf.bbox(vanIsland as AllGeoJSON);

      const squareGrid = turf.squareGrid(bbox, 5);
      console.log('squareGrid');
      console.log(squareGrid.features);

      squareGrid.features.forEach(async (gridItem) => {
        const bufferedGeo = turf.buffer(gridItem, 550 / 1000);
        const wellsInside = await getDataFromDataBC('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW', bufferedGeo);
        await upsert(
          [
            {
              type: UpsertType.RAW_SQL,
              sql: `INSERT INTO layer_data (featureArea, featuresInArea, layerName) VALUES (${gridItem},${wellsInside},well);`
            }
          ],
          databaseContext
        );
      });
      // // const bufferedGeo = turf.buffer(vanIsland.features[0], 550 / 1000);
      // // let wellArray = await getDataFromDataBC('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW', bufferedGeo);

      // try {
      //   squareGrid.features.forEach((gridItem) => {
      //     // alert(JSON.stringify(feature));
      //     let wellArrIndex = 0;
      //     gridItem['pointsInside'] = [];
      //     wellArray.forEach((well) => {
      //       // alert('HERE IS WELL');
      //       // alert(JSON.stringify(well));
      //       if (turf.inside(well, gridItem)) {
      //         gridItem['pointsInside'].push(well);
      //         wellArray.pop(wellArrIndex);
      //       }
      //       wellArrIndex++;
      //     });
      //   });

      //   let insertValuesString: string = '';
      //   squareGrid.features.forEach((feature) => {
      //     insertValuesString = insertValuesString.concat(
      //       `('${JSON.stringify(feature).split(`'`).join(`''`)}','${JSON.stringify(feature['pointsInside'])
      //         .split(`'`)
      //         .join(`''`)}','well') , `
      //     );
      //   });
      //   const replacement = ',';
      //   insertValuesString = insertValuesString.replace(/_([^_]*)$/, replacement + '$1');

      //   const lastComma = insertValuesString.lastIndexOf(',');
      //   insertValuesString =
      //     insertValuesString.substring(0, lastComma) + '' + insertValuesString.substring(lastComma + 1);

      //   console.log(`INSERT INTO layer_data (featureArea, featuresInArea, layerName) VALUES ${insertValuesString};`);

      //   await upsert(
      //     [
      //       {
      //         type: UpsertType.RAW_SQL,
      //         sql: `INSERT INTO layer_data (featureArea, featuresInArea, layerName) VALUES ${insertValuesString};`
      //       }
      //     ],
      //     databaseContext
      //   );
      // } catch (e) {
      //   alert(e);
      // }
    };

    const deleteTripAndFetch = async () => {
      //get the trip again cause it prob changed
      await getTrip();
      const deleteOldTrip = () => {};
      //todo:
      deleteOldTrip();
      //fetch what is selected here:
      setFetching(true);
      Promise.all([fetchLayerData(), fetchActivities(), fetchPointsOfInterest(), fetchMetabaseQueries()])
        .finally(() => setFetching(false))
        .catch((error) => {
          setFetching(false);
          setFetch(false);
          console.log('Error when fetching from network: ' + error);
        });
    };
    if (fetch) {
      deleteTripAndFetch();
    }
  }, [fetch]);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        disabled={fetching}
        onClick={() => {
          setFetch(true);
        }}>
        {'Cache Trip For Offline'}
      </Button>
      {fetching && (
        <>
          <Box width="100%" paddingTop="10px">
            <Typography align="center" variant="h4" component="h3">
              To cancell fetching, exit this page.
            </Typography>
          </Box>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setFetch(false);
            }}>
            {'Cancel fetching data'}
          </Button> */}
          <Box paddingTop="10px" display="flex" alignItems="center">
            <Box width="100%" mr={1}>
              <LinearProgress variant="determinate" value={(totalRecordsFetched / totalRecordsToFetch) * 100} />
            </Box>
            <Box minWidth={35}>
              <Typography variant="body2" color="textSecondary">
                {totalRecordsFetched} out of {totalRecordsToFetch} fetched.
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default TripDataControls;
