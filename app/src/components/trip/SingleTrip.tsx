import { Grid, Paper, Typography } from '@material-ui/core';
import ActivityDataFilter from '../../components/activities-search-controls/ActivitiesFilter';
import PointOfInterestDataFilter from '../../components/point-of-interest-search/PointOfInterestFilter';
import MetabaseSearch from '../../components/search/MetabaseSearch';
import { DocType } from 'constants/database';
import { DatabaseContext2, query, QueryType, upsert, UpsertType } from '../../contexts/DatabaseContext2';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import TripDataControls from './TripDataControls';
import TripNamer from './TripNamer';
import { TripStep } from './TripStep';
import { TripStatusCode } from './TripStepStatus';
import KMLUpload from '../../components/map-buddy-components/KMLUpload';
import { useHistory } from 'react-router';

export const SingleTrip: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext2);
  const [stepState, setStepState] = useState(null);
  const history = useHistory();

  const getStateFromTrip = useCallback(async () => {
    const results = await databaseContext.asyncQueue({
      asyncTask: () => {
        return query({ type: QueryType.DOC_TYPE_AND_ID, docType: DocType.TRIP, ID: props.trip_ID }, databaseContext);
      }
    });

    setStepState(JSON.parse(results[0].json).stepState);
  }, [databaseContext]);

  const saveState = async (newState) => {
    await databaseContext.asyncQueue({
      asyncTask: () => {
        return upsert(
          [
            {
              type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
              ID: props.trip_ID,
              docType: DocType.TRIP,
              json: { stepState: newState }
            }
          ],
          databaseContext
        );
      }
    });

    setStepState(newState);
  };

  // initial fetch
  useEffect(() => {
    getStateFromTrip();
    updateSpacialStatus();
  }, [databaseContext]);

  const updateSpacialStatus = async () => {
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

    const trip = JSON.parse(res[0].json);

    if (trip.geometry.length > 0) {
      return TripStatusCode.ready;
    } else {
      return TripStatusCode.initial;
    }
  };

  const helperCloseOtherAccordions = async (expanded, stepNumber) => {
    const newState: any = [...stepState];
    for (let i = 1; i < stepState.length; i++) {
      const expanded2 = i === stepNumber && expanded ? true : false;
      newState[i] = { ...newState[i], expanded: expanded2 };
    }
    saveState([...newState]);
  };

  //generic helper to mark step as done if there isn't a special purpose check
  const helperStepDoneOrSkip = async (stepNumber) => {
    const newState: any = [...stepState];
    for (let i = 1; i < stepState.length; i++) {
      newState[i] = { ...newState[i], expanded: false };
      if (i === stepNumber) {
        if (i === 2) {
          newState[i] = { ...newState[i], status: await updateSpacialStatus() };
        } else {
          newState[i] = { ...newState[i], status: TripStatusCode.ready };
        }
      }
    }
    saveState([...newState]);
    if (stepNumber === 2 || stepNumber === 3) {
      // Gonna refresh page
      history.push('/home');
      setTimeout(() => {
        history.push('/home/plan');
      }, 250);
    }
  };

  return useMemo(() => {
    return (
      <>
        {stepState ? (
          <Grid item md={12}>
            <TripStep
              title="Step 1: Name your trip"
              helpText="The 'spatial filter' to your search.  Put bounds around data you need to pack with you."
              additionalText="other"
              expanded={stepState[1]?.expanded}
              classes={props.classes}
              tripStepDetailsClassName={props.classes.activityRecordList}
              stepStatus={stepState[1]?.status}
              stepAccordionOnChange={(event, expanded) => {
                helperCloseOtherAccordions(expanded, 1);
              }}
              doneButtonCallBack={() => {
                helperStepDoneOrSkip(1);
              }}>
              <TripNamer trip_ID={props.trip_ID} />
            </TripStep>
            <TripStep
              title="Step 2: Add a spatial boundary for your trip."
              helpText="The 'spatial filter' to your search.  Put bounds around data you need to pack with you."
              additionalText="other"
              expanded={stepState[2].expanded}
              classes={props.classes}
              tripStepDetailsClassName={props.classes.activityRecordList}
              stepStatus={stepState[2]?.status}
              stepAccordionOnChange={(event, expanded) => {
                helperCloseOtherAccordions(expanded, 2);
              }}
              doneButtonCallBack={() => {
                helperStepDoneOrSkip(2);
              }}>
              <Paper className={props.classes.paper}>
                <Typography variant="body1">
                  Draw a polygon or square on the map, or upload a KML/KMZ containing 1 shape.
                </Typography>
                <KMLUpload trip_ID={props.trip_ID} />
              </Paper>
            </TripStep>
            <TripStep
              title="Step 3: Choose past field activity data."
              helpText={`This is where you can cache past activities (observations etc.) to the app.  
                If you want to search for records in a particular area, draw a polygon on the map.`}
              additionalText="other"
              expanded={stepState[3].expanded}
              classes={props.classes}
              tripStepDetailsClassName={props.classes.activityRecordList}
              stepStatus={stepState[3].status}
              stepAccordionOnChange={(event, expanded) => {
                helperCloseOtherAccordions(expanded, 3);
              }}
              doneButtonCallBack={() => {
                helperStepDoneOrSkip(3);
              }}>
              <ActivityDataFilter trip_ID={props.trip_ID} />
            </TripStep>
            <TripStep
              title="Step 4: Choose data from other systems, (IAPP)"
              helpText={`This is where you can cache IAPP sites, and later other points of interest.  
                If you want to search for records in a particular area, draw a polygon on the map.`}
              additionalText="other"
              expanded={stepState[4].expanded}
              classes={props.classes}
              tripStepDetailsClassName={props.classes.pointOfInterestList}
              stepStatus={stepState[4].status}
              stepAccordionOnChange={(event, expanded) => {
                helperCloseOtherAccordions(expanded, 4);
              }}
              doneButtonCallBack={() => {
                helperStepDoneOrSkip(4);
              }}>
              <PointOfInterestDataFilter trip_ID={props.trip_ID} />
            </TripStep>
            <TripStep
              title="OPTIONAL: Get data from a Metabase Question"
              helpText="If you have a Metabase question that contains field activity ID's, you can load those records here."
              additionalText="other"
              expanded={stepState[5].expanded}
              classes={props.classes}
              tripStepDetailsClassName={props.classes.pointOfInterestList}
              stepStatus={stepState[5].status}
              stepAccordionOnChange={(event, expanded) => {
                helperCloseOtherAccordions(expanded, 5);
              }}
              doneButtonCallBack={() => {
                helperStepDoneOrSkip(5);
              }}>
              <MetabaseSearch trip_ID={props.trip_ID} />
            </TripStep>
            <TripStep
              title="Last Step: Cache, Refresh, or Delete data for Trip "
              helpText="Cache the data and map data for the region you have selected, or refresh it, or delete."
              additionalText="other"
              expanded={stepState[6].expanded}
              classes={props.classes}
              tripStepDetailsClassName={props.classes.pointOfInterestList}
              stepStatus={stepState[6].status}
              stepAccordionOnChange={(event, expanded) => {
                helperCloseOtherAccordions(expanded, 6);
              }}
              doneButtonCallBack={() => {
                helperStepDoneOrSkip(6);
              }}>
              <TripDataControls
                setCacheMapTilesFlag={props.setCacheMapTilesFlag}
                setTripDeleted={props.setTripDeleted}
                trip_ID={props.trip_ID}
              />
            </TripStep>
          </Grid>
        ) : (
          <>
            test
            {/*  <Spinner /> */}
          </>
        )}
      </>
    );
  }, [JSON.stringify(stepState), props.geometry]);
};
