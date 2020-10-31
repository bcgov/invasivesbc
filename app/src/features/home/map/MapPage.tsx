import { Container, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import MapContainer from 'components/map/MapContainer';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useContext, useEffect, useState } from 'react';

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

  const getAllActivities = async () => {
    let docs = await databaseContext.database.find({
      selector: {
        docType: { $in: [DocType.REFERENCE_ACTIVITY, DocType.ACTIVITY] }
      }
    });

    if (!docs || !docs.docs || !docs.docs.length) {
      return;
    }

    let geos = [];
    docs.docs.forEach((row) => {
      if (!row.geometry || !row.geometry.length) {
        return;
      }

      geos.push(row.geometry[0]);
    });

    setGeometry(geos);
  };

  useEffect(() => {
    const updateComponent = () => {
      getAllActivities();
    };

    updateComponent();
  }, [databaseChangesContext]);

  return (
    <Container className={clsx(classes.mapContainer)} maxWidth={false} disableGutters={true}>
      <MapContainer
        classes={classes}
        mapId={'mainMap'}
        geometryState={{ geometry, setGeometry }}
        extentState={{ extent, setExtent }}
      />
    </Container>
  );
};

export default MapPage;
