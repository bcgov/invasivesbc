import clsx from 'clsx';
import { Container, makeStyles, Theme } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { IonSpinner } from '@ionic/react';

const useStyles = makeStyles((theme: Theme) => ({
  mapContainer: {
    height: '100%'
  },
  map: {
    height: '100%',
    width: '100%'
  }
}));

interface IMapProps {
  classes?: any;
}

const MapPage: React.FC<IMapProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);
  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);
  const [canLoadMap, setCanLoadMap] = useState(false);

  const getAllActivities = async () => {
    let docs = await databaseContext.database.find({
      selector: {
        docType: { $in: [DocType.REFERENCE_ACTIVITY, DocType.ACTIVITY] }
      }
    });

    let geos = [];
    if (!docs.docs.length) {
      return;
    }

    let activities = docs.docs;
    activities.map((row) => {
      if (!row.geometry || !row.geometry.length) {
        return;
      }
      geos.push(row.geometry[0]);
      console.log('pushed a row')
    });
    setGeometry(geos);
    setCanLoadMap(true)
  };

  useEffect(() => {
    const updateComponent = () => {
      getAllActivities();
    };
    updateComponent();
  }, [databaseChangesContext]);

  return (
    <Container className={clsx(classes.mapContainer)} maxWidth={false} disableGutters={true}>
      {canLoadMap ? (
        <MapContainer
          classes={classes}
          mapId={'mainMap'}
          geometryState={{ geometry, setGeometry }}
          extentState={{ extent, setExtent }}
        />
      ) : (
        <IonSpinner />
      )}

    </Container>
  );
};

export default MapPage;
