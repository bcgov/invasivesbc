import { Container, Grid, makeStyles, Paper } from '@material-ui/core';
import ManageDatabaseContainer from 'components/database/ClearDatabase';
import MapContainer from 'components/map/MapContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useContext, useEffect, useState } from 'react';

import { kml } from '@tmcw/togeojson';
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

  // Raw file kept in useState var and converted to Geo before hitting db:
  const [aFile, setAFile] = useState(null);

  const saveKML = async (input: File) => {
    const fileAsString = await input.text().then((xmlString) => {
      return xmlString;
    });
    const DOMFromXML = new DOMParser().parseFromString(fileAsString);
    const geoFromDOM = kml(DOMFromXML);
    console.log('geo');
    console.dir(geoFromDOM);

    if (geoFromDOM) {
      console.log('saving geo feat collection');
      databaseContext.database.upsert('theShapeAsGeoFeatureCollection', (shapeLastTime) => {
        return geoFromDOM;
      });
    }
  };

  useEffect(() => {
    if (aFile) {
      saveKML(aFile);
    }
  }, [aFile]);

  return (
    <DropzoneArea
      dropzoneText="Upload KML here"
      onChange={(e) => {
        setAFile(e[0]);
      }}
    />
  );
};

const Trip: React.FC<any> = (props) => {
  return <></>;
};

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  const [geoFeatCollection, setGeoFeatCollection] = useState(null);

  const databaseContext = useContext(DatabaseContext);
  const getGeos = () => {
    databaseContext.database
      .find({
        selector: {
          _id: 'theShapeAsGeoFeatureCollection'
        }
      })
      .then((doc) => {
        if (doc && doc.docs) {
          if (doc.docs[0]) {
            setGeoFeatCollection(doc.docs[0]);
          }
        }
      });
  };

  useEffect(() => {
    getGeos();
  }, []);


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
              <MapContainer {...props} kmlAsGeoFeatCollection={geoFeatCollection} classes={classes} />
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
