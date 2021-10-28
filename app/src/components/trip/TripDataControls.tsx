import { Box, Button, makeStyles } from '@material-ui/core';
import { DocType } from 'constants/database';
import { DatabaseContext2, query, QueryType, upsert, UpsertType } from '../../contexts/DatabaseContext2';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import * as turf from '@turf/turf';
import {
  IActivitySearchCriteria,
  IPointOfInterestSearchCriteria,
  IMetabaseQuerySearchCriteria
} from '../../interfaces/useInvasivesApi-interfaces';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import geoData from '../../components/map/LayerPicker/GEO_DATA.json';
import { getDataFromDataBC, getStylesDataFromBC } from '../../components/map/WFSConsumer';
import { IWarningDialog, WarningDialog } from '../../components/dialog/WarningDialog';
import { IProgressDialog, ProgressDialog } from '../../components/dialog/ProgressDialog';

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

  const [trip, setTrip] = useState(null);

  const [warningDialog, setWarningDialog] = useState<IWarningDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });

  const [progressDialog, setProgressDialog] = useState<IProgressDialog>({
    dialogOpen: false,
    dialogTitle: 'Caching data for the trip',
    items: [
      {
        name: 'Map Layers',
        state: 'none'
      },
      {
        name: 'Activities',
        state: 'none'
      },
      {
        name: 'Points of Interest',
        state: 'none'
      },
      {
        name: 'Metabase Queries',
        state: 'none'
      }
    ]
  });

  //helper function to get all layer names from geo_data.json file
  const getLayerNamesFromJSON = (geoDataJSON: any) => {
    const layerNamesArr = [];
    geoDataJSON.forEach((pLayer) => {
      pLayer.children.forEach((cLayer) => {
        if (cLayer.bcgw_code) {
          layerNamesArr.push(cLayer.bcgw_code);
        }
      });
    });
    return layerNamesArr;
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
        console.log('Could not fetch photos for ' + row._id);
      }
      return photos;
    }
    return [];
  };

  const getTrip = useCallback(async () => {
    const queryResults = await databaseContext.asyncQueue({
      asyncTask: () => {
        return query({ type: QueryType.DOC_TYPE_AND_ID, ID: props.trip_ID, docType: DocType.TRIP }, databaseContext);
      }
    });

    setTrip(JSON.parse(queryResults[0].json));
  }, [databaseContext]);

  useEffect(() => {
    const updateComponent = async () => {
      getTrip();
    };
    updateComponent();
  }, [getTrip]);

  const fetchActivities = async () => {
    setProgressDialog((prevState) => {
      const itemsArr = prevState.items;
      itemsArr[1] = { ...itemsArr[1], state: 'in_progress' };
      return {
        ...prevState,
        items: itemsArr
      };
    });

    if (!trip || !trip.activityChoices || !trip.activityChoices.length) {
      setProgressDialog((prevState) => {
        const itemsArr = prevState.items;
        itemsArr[1] = {
          ...itemsArr[1],
          state: 'complete',
          description: `The step is skipped as there were no activity choices entered.`
        };
        return {
          ...prevState,
          items: itemsArr
        };
      });
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
        numberActivitiesFetched += await databaseContext.asyncQueue({
          asyncTask: () => {
            return upsert(upserts, databaseContext);
          }
        });
        console.log(`Cached ${numberActivitiesFetched} activities.`);
      } catch (error) {
        console.log('Error with inserting Activities into database: ' + error);
        setProgressDialog((prevState) => {
          const itemsArr = prevState.items;
          itemsArr[1] = {
            ...itemsArr[1],
            state: 'error',
            description: `There was an error inserting Activities into database: ${error}`
          };
          return {
            ...prevState,
            items: itemsArr
          };
        });
      }
    }
    setProgressDialog((prevState) => {
      const itemsArr = prevState.items;
      itemsArr[1] = { ...itemsArr[1], state: 'complete', description: `Cached ${numberActivitiesFetched} activities.` };
      return {
        ...prevState,
        items: itemsArr
      };
    });
    console.log(`Cached ${numberActivitiesFetched}activities.`);
  };

  const fetchPointsOfInterest = async () => {
    setProgressDialog((prevState) => {
      const itemsArr = prevState.items;
      itemsArr[2] = { ...itemsArr[2], state: 'in_progress' };
      return {
        ...prevState,
        items: itemsArr
      };
    });

    try {
      if (!trip || !trip.pointOfInterestChoices || !trip.pointOfInterestChoices.length) {
        setProgressDialog((prevState) => {
          const itemsArr = prevState.items;
          itemsArr[2] = {
            ...itemsArr[2],
            state: 'complete',
            description: `The step is skipped as there were no point of interest choices entered.`
          };
          return {
            ...prevState,
            items: itemsArr
          };
        });
        return;
      }

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

        if (response === undefined) {
          console.log('response is undefined');
        }

        const totalToFetch = response.count;
        console.log('*** total points of interest to get:  ' + response.count);
        while (numberPointsOfInterestFetched !== totalToFetch) {
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
          console.log('*** total points of interest fetched:  ' + numberPointsOfInterestFetched);
          console.log('*** total points of interest to get:  ' + totalToFetch);
          pointOfInterestSearchCriteria.page += 1;
          console.log(pointOfInterestSearchCriteria);
        }
      }
      setProgressDialog((prevState) => {
        const itemsArr = prevState.items;
        itemsArr[2] = {
          ...itemsArr[2],
          state: 'complete',
          description: `Cached ${numberPointsOfInterestFetched} points of interest.`
        };
        return {
          ...prevState,
          items: itemsArr
        };
      });
      console.log(`Cached ${numberPointsOfInterestFetched} points of interest.`);
    } catch (e) {
      setProgressDialog((prevState) => {
        const itemsArr = prevState.items;
        itemsArr[2] = {
          ...itemsArr[2],
          state: 'error',
          description: `Error: ${e}`
        };
        return {
          ...prevState,
          items: itemsArr
        };
      });
    }
  };

  const fetchMetabaseQueries = async () => {
    setProgressDialog((prevState) => {
      const itemsArr = prevState.items;
      itemsArr[3] = { ...itemsArr[3], state: 'in_progress' };
      return {
        ...prevState,
        items: itemsArr
      };
    });

    try {
      if (!trip || !trip.metabaseChoices || !trip.metabaseChoices.length) {
        setProgressDialog((prevState) => {
          const itemsArr = prevState.items;
          itemsArr[3] = {
            ...itemsArr[3],
            state: 'complete',
            description: `The step is skipped as there were no metabase choices entered.`
          };
          return {
            ...prevState,
            items: itemsArr
          };
        });
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
          console.log('Metabase Query ID cannot be blank, please select a query');
          return;
        }

        const response = await invasivesApi.getMetabaseQueryResults(querySearchCriteria);
        await databaseContext.asyncQueue({
          asyncTask: () => {
            return upsert(
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
          }
        });

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
          console.log(`Error with inserting Metabase results into database: ${error}`);
        }
      }
      setProgressDialog((prevState) => {
        const itemsArr = prevState.items;
        itemsArr[3] = { ...itemsArr[3], state: 'complete' };
        return {
          ...prevState,
          items: itemsArr
        };
      });
      console.log(
        `Cached ${countActivities ? countActivities + ' activities' : ''} 
          ${countActivities && countPois ? ' and ' : ''} 
          ${countPois ? countPois + ' points of interest' : ''} 
          ${countActivities || countPois ? ' from Metabase.' : '0 Metabase results.'}`
      );
    } catch (e) {
      setProgressDialog((prevState) => {
        const itemsArr = prevState.items;
        itemsArr[3] = { ...itemsArr[3], state: 'error', description: `Error: ${e}` };
        return {
          ...prevState,
          items: itemsArr
        };
      });
    }
  };

  const fetchLayerData = async () => {
    setProgressDialog((prevState) => {
      const itemsArr = prevState.items;
      itemsArr[0] = { ...itemsArr[0], state: 'in_progress' };
      return {
        ...prevState,
        items: itemsArr
      };
    });

    try {
      console.log('starting to fetch layer data...');
      //getting the trip
      const res = await databaseContext.asyncQueue({
        asyncTask: () => {
          return query(
            {
              type: QueryType.DOC_TYPE_AND_ID,
              docType: DocType.TRIP,
              ID: props.trip_ID
            },
            databaseContext
          );
        }
      });

      //convert geo to feature collection
      const tripGeo = {
        type: 'FeatureCollection',
        features: JSON.parse(res[0].json).geometry
      };

      //get all large grid items that overlap with geo
      const largeGridResult = await invasivesApi.getGridItemsThatOverlapPolygon(
        JSON.stringify(tripGeo.features[0].geometry),
        '1'
      );

      //get all the ids of large grid items
      const idArr = [];
      largeGridResult.forEach((row) => {
        idArr.push(row.id);
      });

      // get all small grid items associated with list of large grid items that overlap with geo
      const smallGridResult = await invasivesApi.getGridItemsThatOverlapPolygon(
        JSON.stringify(tripGeo.features[0].geometry),
        '0',
        idArr
      );

      const layerNames = getLayerNamesFromJSON(geoData);
      // for each layer name, do...
      for (let layerNamesIndex = 0; layerNamesIndex < layerNames.length; layerNamesIndex++) {
        let itemsPushedForLayer = 0;
        const layerName = layerNames[layerNamesIndex];
        //get layer styles
        getStylesDataFromBC(layerName).then(async (returnStyles) => {
          await upsert(
            [
              {
                type: UpsertType.RAW_SQL,
                sql: `INSERT OR REPLACE INTO LAYER_STYLES (layerName,json) values ('${layerName}','${JSON.stringify(
                  returnStyles
                )}');`
              }
            ],
            databaseContext
          );
        });

        //for each large grid item, do...
        for (let largeGridResultIndex = 0; largeGridResultIndex < largeGridResult.length; largeGridResultIndex++) {
          const row = largeGridResult[largeGridResultIndex];
          //insert large grid item into sqllite table
          await databaseContext.asyncQueue({
            asyncTask: () => {
              return upsert(
                [
                  {
                    type: UpsertType.RAW_SQL,
                    sql: `INSERT INTO LARGE_GRID_LAYER_DATA (id, featureArea) VALUES
                  (${row.id},
                  '${JSON.stringify(row.geo).split(`'`).join(`''`)}')
                  ON CONFLICT(id) DO UPDATE SET
                      featureArea='${JSON.stringify(row.geo).split(`'`).join(`''`)}';`
                  }
                ],
                databaseContext
              );
            }
          });
        }
        let gridItemsArr = [];
        //for each small grid item, do...
        for (let smallGridResultIndex = 0; smallGridResultIndex < smallGridResult.length; smallGridResultIndex++) {
          const gridResult = smallGridResult[smallGridResultIndex];
          const feature = JSON.parse(gridResult.geo);
          const gridId = gridResult.id;
          const bufferedGeo = turf.buffer(feature, 0);

          //push gridItem and callback function to the queue

          //callback function responsible for fetching all the features in area.
          let featuresInArea;
          //If there are custom api endpoints, use them, if not, use WFS consumer.
          switch (layerName) {
            case 'LEAN_POI':
              const poiRes = await invasivesApi.getPointsOfInterestLean({ search_feature: bufferedGeo });
              if (poiRes) {
                const filteredArr = poiRes.rows.map((res) => {
                  return res.geojson;
                });
                featuresInArea = filteredArr;
              } else {
                featuresInArea = [];
              }
              break;
            case 'LEAN_ACTIVITIES':
              const actRes = await invasivesApi.getActivitiesLean({ search_feature: bufferedGeo });
              if (actRes) {
                const filteredArr = actRes.rows.map((res) => {
                  return res.geojson;
                });
                featuresInArea = filteredArr;
              } else {
                featuresInArea = [];
              }
              break;
            case 'jurisdiction':
              const jurRes = await invasivesApi.getJurisdictions({ search_feature: bufferedGeo });
              if (jurRes && jurRes.name !== 'error') {
                const filteredArr = jurRes.rows.map((res) => {
                  return res.geojson;
                });
                featuresInArea = filteredArr;
              } else {
                featuresInArea = [];
              }
              break;
            default:
              featuresInArea = await getDataFromDataBC(layerName, bufferedGeo);
              break;
          }

          //pushing complete grid item with features inside to the array
          if (featuresInArea?.length > 0) {
            gridItemsArr.push({
              id: gridId,
              bufferedGeo: bufferedGeo,
              featureArea: JSON.stringify(bufferedGeo).split(`'`).join(`''`),
              layerName: layerName,
              featuresInArea: JSON.stringify(featuresInArea).split(`'`).join(`''`),
              largeGridID: gridResult.large_grid_item_id
            });
            itemsPushedForLayer++;
          }
          if (
            gridItemsArr.length > 0 &&
            (gridItemsArr.length > 49 || smallGridResultIndex === smallGridResult.length - 1)
          ) {
            let insertValuesString = '';
            //constructing insert string (values)
            for (let gridItemsIndex = 0; gridItemsIndex <= gridItemsArr.length - 1; gridItemsIndex++) {
              const gridItem = gridItemsArr[gridItemsIndex];

              if (gridItemsIndex === gridItemsArr.length - 1) {
                insertValuesString += `(
                          ${gridItem.id},
                          '${gridItem.featureArea}',
                          '${gridItem.featuresInArea}',
                          '${gridItem.layerName}',
                          ${gridItem.largeGridID})`;
              } else {
                insertValuesString += `(
                          ${gridItem.id},
                          '${gridItem.featureArea}',
                          '${gridItem.featuresInArea}',
                          '${gridItem.layerName}',
                          ${gridItem.largeGridID}), `;
              }
            }

            //performing batch upsert
            await databaseContext.asyncQueue({
              // eslint-disable-next-line
              asyncTask: () => {
                return upsert(
                  [
                    {
                      type: UpsertType.RAW_SQL,
                      sql: `INSERT INTO SMALL_GRID_LAYER_DATA (id, featureArea, featuresInArea, layerName, largeGridID) VALUES ${insertValuesString}
                          ON CONFLICT(id, layerName) DO
                          UPDATE SET
                            featureArea=excluded.featureArea,
                            featuresInArea=excluded.featuresInArea,
                            largeGridID=excluded.largeGridID;`
                    }
                  ],
                  databaseContext
                );
              }
            });

            //emptying the array to fill it with 50 items on next iteration
            gridItemsArr = [];
          }
        }
        setProgressDialog((prevState) => {
          const itemsArr = prevState.items;
          itemsArr[0] = {
            ...itemsArr[0],
            description: `Cached ${itemsPushedForLayer} features of ${layerName}.`
          };
          return {
            ...prevState,
            items: itemsArr
          };
        });
        itemsPushedForLayer = 0;
      }
      setProgressDialog((prevState) => {
        const itemsArr = prevState.items;
        itemsArr[0] = { ...itemsArr[0], state: 'complete', description: '' };
        return {
          ...prevState,
          items: itemsArr
        };
      });
    } catch (e) {
      setProgressDialog((prevState) => {
        const itemsArr = prevState.items;
        itemsArr[0] = { ...itemsArr[0], state: 'error', description: `Error: ${e}` };
        return {
          ...prevState,
          items: itemsArr
        };
      });
      console.log('There was an error fetching layer data from the map. Skipping to the next step...');
      console.log(e);
    }
  };

  const deleteOldTrip = async () => {
    setWarningDialog({
      dialogOpen: true,
      dialogTitle: 'Are you sure?',
      dialogContentText: 'You are about to delete this trip. Are you sure you want to do this?',
      dialogActions: [
        {
          actionName: 'No',
          actionOnClick: async () => {
            setWarningDialog({ ...warningDialog, dialogOpen: false });
          }
        },
        {
          actionName: 'Yes',
          actionOnClick: async () => {
            await databaseContext.asyncQueue({
              asyncTask: () => {
                return upsert(
                  [
                    {
                      type: UpsertType.RAW_SQL,
                      sql: `DELETE FROM TRIP WHERE id=${props.trip_ID}`
                    }
                  ],
                  databaseContext
                );
              }
            });
            console.log(`Trip #${props.trip_ID} was deleted!`);
            props.setTripDeleted(props.trip_ID);
            setWarningDialog({ ...warningDialog, dialogOpen: false });
          },
          autoFocus: true
        }
      ]
    });

    return null;
  };

  const deleteTripAndFetch = async () => {
    setProgressDialog((prevState) => ({
      ...prevState,
      dialogOpen: true
    }));
    //NOSONAR
    props.setCacheMapTilesFlag({
      flag: Math.random() * 100
    });
    //get the trip again cause it prob changed
    await getTrip();

    //fetch what is selected here:
    try {
      await fetchLayerData();
      await fetchActivities();
      await fetchPointsOfInterest();
      await fetchMetabaseQueries();
    } catch (error) {
      setProgressDialog((prevState) => ({
        dialogOpen: true,
        error: true,
        ...prevState
      }));
      console.log('Error when fetching from network: ' + error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <Button
          style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}
          variant="contained"
          color="primary"
          // disabled={fetching}
          onClick={() => {
            deleteTripAndFetch();
          }}>
          {'Cache Trip For Offline'}
        </Button>
        <Button
          style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}
          variant="contained"
          color="primary"
          // disabled={fetching}
          onClick={() => {
            deleteOldTrip();
          }}>
          {'Delete this trip'}
        </Button>
      </Box>
      <WarningDialog
        dialogOpen={warningDialog.dialogOpen}
        dialogTitle={warningDialog.dialogTitle}
        dialogActions={warningDialog.dialogActions}
        dialogContentText={warningDialog.dialogContentText}
      />
      <ProgressDialog
        dialogOpen={progressDialog.dialogOpen}
        dialogTitle={progressDialog.dialogTitle}
        items={progressDialog.items}
        done={progressDialog.done}
        error={progressDialog.error}
      />
    </>
  );
};

export default TripDataControls;
