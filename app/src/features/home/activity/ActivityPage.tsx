import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Container,
  makeStyles,
  Typography
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import FormContainer from 'components/form/FormContainer';
import MapContainer from 'components/map/MapContainer';
import PhotoContainer from 'components/photo/PhotoContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular
  },
  mapContainer: {
    height: '600px'
  },
  map: {
    height: '100%',
    width: '100%'
  }
}));

interface IActivityPageProps {
  classes?: any;
}

const ActivityPage: React.FC<IActivityPageProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const getActivityData = async () => {
      const appState = await databaseContext.database.find({ selector: { _id: 'AppState' } });

      if (!appState || !appState.docs || !appState.docs.length) {
        return;
      }

      const doc = await databaseContext.database.find({ selector: { _id: appState.docs[0].activeActivity } });

      setDoc(doc.docs[0]);
    };

    getActivityData();
  }, [databaseContext]);

  if (!doc) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Map</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.mapContainer}>
          <MapContainer {...props} classes={classes} activity={doc} />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
          <Typography className={classes.heading}>Form</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormContainer {...props} activity={doc} />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
          <Typography className={classes.heading}>Photos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PhotoContainer {...props} activity={doc} />
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default ActivityPage;
