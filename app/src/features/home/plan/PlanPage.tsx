import { Button, CircularProgress, Container, IconButton, makeStyles, Paper } from '@material-ui/core';
import { DeleteForever } from '@material-ui/icons';
import MapContainer2 from '../../../components/map/MapContainer2';
import { Feature, GeoJsonObject } from 'geojson';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MapContextMenuData } from '../map/MapContextMenu';
import { TripStatusCode } from '../../../components/trip/TripStepStatus';
import RecordTable from '../../../components/common/RecordTable';
import { DocType } from 'constants/database';
import { Capacitor } from '@capacitor/core';
import * as _ from 'lodash';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { DatabaseContext2, query, QueryType, upsert, UpsertType } from '../../../contexts/DatabaseContext2';
import { SingleTrip } from '../../../components/trip/SingleTrip';

interface IPlanPageProps {
  classes?: any;
}

const useStyles = makeStyles((theme) => ({
  accordionSummary: {
    padding: theme.spacing(2),
    //todo more spacing, above doesnt work
    textAlign: 'center'
  },
  tripList: {
    width: '100%'
  },
  tripAccordionGridItem: {
    textAlign: 'left'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0
  },
  layerPicker: {
    height: '100%',
    width: '100%'
  },
  activityRecordList: {
    flexDirection: 'column'
  },
  pointOfInterestList: {
    flexDirection: 'column'
  },
  activityRecordQueryParmsRow: {
    width: '400px'
  },
  //TODO:  make colour of bar depend on how much is used (red = full/bad)
  tripStorageUsageBar: {
    height: '20px',
    borderRadius: '20px'
  },
  totalStorageUsageBar: {
    height: '20px',
    borderRadius: '20px'
  },
  tripGrid: {
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  tripAccordion: {
    display: 'block'
  }
}));

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext2);

  const [geometry, setGeometry] = useState<Feature[]>([]);

  const [interactiveGeometry, setInteractiveGeometry] = useState<GeoJsonObject>(null);
  const [extent, setExtent] = useState(null);

  const [newTripID, setNewTripID] = useState(null);
  const [trips, setTrips] = useState(null);
  const [tripsLoaded, setTripsLoaded] = useState(null);
  const [currentTripId, setCurrentTripId] = useState(null);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  const dataAccess = useDataAccess();

  const getTrips = async () => {
    const newTrips = [];
    //todo:  try to wrap this all in db context so we don't need to reference both dbs here
    let results: any; //sqlite db response

    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      results = await dataAccess.getTrips(databaseContext);
    } else {
      return;
    }

    if ((Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') && results) {
      results.map((adoc) => {
        try {
          const doc = JSON.parse(adoc.json);
          newTrips.push({ trip_ID: doc.trip_ID, trip_name: doc.name, num_activities: 5, num_POI: 4 });
        } catch (e) {
          console.log('error pushign to trips');
          console.log(e);
          console.log(adoc);
        }
        return null;
      });
    }

    setTrips([...newTrips]);
    console.log('set trips to ' + newTrips.length);
  };

  const withAsyncQueue = async (request: any) => {
    return databaseContext.asyncQueue({
      asyncTask: () => {
        return request;
      }
    });
  };

  useEffect(() => {
    const upsertGeo = async () => {
      const res = await withAsyncQueue(
        query(
          {
            type: QueryType.RAW_SQL,
            sql: `SELECT json FROM TRIP WHERE id=${currentTripId};`
          },
          databaseContext
        )
      );
      const geoFromQuery = JSON.parse(res[0].json).geometry;
      const idFromQuery = JSON.parse(res[0].json).trip_ID;
      if (!_.isEqual(geoFromQuery, geometry)) {
        withAsyncQueue(
          upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
                docType: DocType.TRIP,
                ID: currentTripId,
                json: { geometry: geometry }
              }
            ],
            databaseContext
          )
        );
      }
    };

    if (currentTripId) {
      upsertGeo();
    }
  }, [geometry]);

  useEffect(() => {
    const queryForGeo = async () => {
      const res = await withAsyncQueue(
        query(
          {
            type: QueryType.RAW_SQL,
            sql: `SELECT json FROM TRIP WHERE id=${currentTripId};`
          },
          databaseContext
        )
      );
      if (res.length > 0) {
        const geoFromQuery = JSON.parse(res[0].json).geometry;
        setGeometry(geoFromQuery);
      }
    };
    queryForGeo();
  }, [currentTripId]);

  useEffect(() => {
    if (trips != null) {
      setTripsLoaded(true);
    }
  }, [trips]);

  const helperGetMaxTripID = async () => {
    if (!databaseContext) {
      return 0;
    }

    const sql = 'select max(id) as id from trip;';
    const results = await query({ type: QueryType.RAW_SQL, sql }, databaseContext);
    return results.length > 0 ? results[0].id : 0;
  };

  // initial fetch
  useEffect(() => {
    const initialLoad = async () => {
      await getTrips();
    };
    initialLoad();
  }, [newTripID, tripsLoaded]);

  const addTrip = async () => {
    let newID = await helperGetMaxTripID();
    newID = newID !== 'NULL' ? newID + 1 : 1;
    const newTripObj = {
      trip_ID: newID,
      geometry: [],
      trip_name: 'New Unnamed Trip',
      num_activities: 0,
      num_POI: 0,
      docType: DocType.TRIP,
      stepState: [
        {}, //just here so indexes match up with step number
        { status: TripStatusCode.initial, expanded: true },
        { status: TripStatusCode.initial, expanded: false },
        { status: TripStatusCode.initial, expanded: false },
        { status: TripStatusCode.initial, expanded: false },
        { status: TripStatusCode.initial, expanded: false },
        { status: TripStatusCode.initial, expanded: false }
      ]
    };
    await dataAccess.addTrip(newTripObj, databaseContext);
    setGeometry([]);

    setNewTripID(newID);
  };

  const trashTrip = async (trip_ID, tripName) => {
    setNewTripID(Math.random()); //NOSONAR
  };

  const helperMarkTripAsCurrent = async (trip_ID: any) => {
    // await withAsyncQueue(
    //   upsert(
    //     [
    //       {
    //         type: UpsertType.RAW_SQL,
    //         sql: 'UPDATE TRIP SET isCurrent = 0;'
    //       }
    //     ],
    //     databaseContext
    //   )
    // );
    // await withAsyncQueue(
    //   upsert(
    //     [
    //       {
    //         type: UpsertType.RAW_SQL,
    //         sql: `UPDATE TRIP SET isCurrent = 1 WHERE ID=${trip_ID};`
    //       }
    //     ],
    //     databaseContext
    //   )
    // );
    setCurrentTripId(trip_ID);
  };

  const mapMemo = useMemo(() => {
    return (
      <Paper className={classes.paper}>
        <MapContainer2
          {...props}
          classes={classes}
          showDrawControls={true}
          mapId={'TODO_this_needs_to_be_a_globally_uniqe_id_per_map_instance'}
          isPlanPage={true}
          geometryState={{ geometry, setGeometry }}
          interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
          extentState={{ extent, setExtent }}
          contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
        />
      </Paper>
    );
  }, [geometry, interactiveGeometry, tripsLoaded]);

  return (
    <Container className={props.classes.container}>
      {mapMemo}
      <Button onClick={addTrip} color="primary" variant="contained">
        Add Trip
      </Button>
      {!tripsLoaded && (
        <>
          <CircularProgress />
        </>
      )}
      {tripsLoaded && (
        <RecordTable
          className={classes.tripList}
          tableName={'My Trips'}
          onToggleExpandRow={(row) => {
            helperMarkTripAsCurrent(row.trip_ID);
          }}
          keyField="trip_ID" // defaults to just use 'id'
          // startingOrder="survey_date"
          // defaults to first table column
          headers={[
            // each id is the key it will look for in each data row object
            {
              id: 'trip_ID',
              title: 'Trip ID'
            },
            {
              id: 'trip_name',
              title: 'Trip Name'
            },
            {
              id: 'num_activities',
              title: '# of Activities Cached'
            },
            {
              id: 'num_poi',
              title: '# of POI Cached'
            },
            {
              id: 'buttons'
              // no title, for a blank header col
            }
          ]}
          rows={
            // array of data objects to render
            !trips?.length
              ? []
              : trips.map((row) => ({
                  ...row,
                  // custom map data before it goes to table:
                  buttons: (row) => (
                    // can render a custom cell like this, to e.g. render custom buttons.  Will build these controls into the table too though
                    <IconButton>
                      <DeleteForever
                        onClick={() => {
                          trashTrip(row.trip_ID, row.trip_name);
                        }}
                      />
                    </IconButton>
                  )
                }))
          }
          dropdown={(row) => {
            return <SingleTrip trip_ID={row.trip_ID} classes={classes} />;
          }}></RecordTable>
      )}
    </Container>
  );
};

export default PlanPage;
