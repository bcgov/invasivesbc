import * as L from 'leaflet';
import { CircularProgress, Container, makeStyles } from '@material-ui/core';
import ActivityComponent from 'components/activity/ActivityComponent';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Feature } from 'geojson';

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
  },
  formContainer: {},
  photoContainer: {}
}));

interface IReferencesActivityPage {
  classes?: any;
  match?: any;
}

const ReferencesActivityPage: React.FC<IReferencesActivityPage> = (props) => {
  const urlParams = useParams();

  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);

  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const getActivityData = async () => {
      const activityResult = await databaseContext.database.find({ selector: { _id: urlParams['id'] } });

      setGeometry(activityResult.docs[0].geometry);
      setDoc(activityResult.docs[0]);
    };

    getActivityData();
  }, [databaseChangesContext]);

  if (!doc) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <ActivityComponent
        classes={classes}
        activity={doc}
        mapId={doc._id}
        geometryState={{ geometry, setGeometry }}
        extentState={{ extent, setExtent }}
      />
    </Container>
  );
};

export default ReferencesActivityPage;
