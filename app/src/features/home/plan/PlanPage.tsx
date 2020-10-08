import { Container, Grid, makeStyles, Paper } from '@material-ui/core';
import ManageDatabaseContainer from 'components/database/ClearDatabase';
import MapContainer from 'components/map/MapContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useContext, useEffect, useState } from 'react';

import { kml } from '@tmcw/togeojson';
var fs = require('fs');
// node doesn't have xml parsing or a dom. use xmldom
const DOMParser = require('xmldom').DOMParser;

interface IPlanPageProps {
  classes?: any;
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  mapContainer: {
    height: '600px'
  },
  map: {
    height: '500px',
    width: '100%'
  }
}));

const KMLUpload: React.FC<any> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const [aKml, setAKML] = useState(null);

  useEffect(() => {
    if (aKml) {
      console.dir(aKml);
      console.dir(aKml[0]);

      console.log(aKml[0])
      console.log(aKml[0].toString())
      //let loadedKMLFromFile = new DOMParser().parseFromString(fs.readFileSync(aKml.path));

     /* databaseContext.database.upsert('theShapeAsGeo', (shapeLastTime) => {
        console.dir(aKml);
        return kml(loadedKMLFromFile);
      });*/
    }
  }, [aKml]);

  return (
    <DropzoneArea
      dropzoneText="Upload KML here"
      onChange={(e) => {
        setAKML(e);
      }}
    />
  );
};

const Trip: React.FC<any> = (props) => {
  return <></>;
};

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const classes = useStyles();
  return (
    <Container className={props.classes.container}>
      <ManageDatabaseContainer />
      <Paper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>Zoe's wild trip</Paper>
          </Grid>
          <Grid item xs={6}>
            <KMLUpload />
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <MapContainer {...props} classes={classes} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PlanPage;
