import clsx from 'clsx';
import { Container, makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import MapContainer from 'components/map/MapContainer';

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

  return (
    <Container className={clsx(classes.mapContainer)} maxWidth={false} disableGutters={true}>
      <MapContainer classes={classes} />
    </Container>
  );
};

export default MapPage;
