import clsx from 'clsx';
import { Container, makeStyles, Theme } from '@material-ui/core';
import React, { useState } from 'react';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';

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

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);

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
