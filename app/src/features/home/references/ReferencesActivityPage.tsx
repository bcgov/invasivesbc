import { CircularProgress, Container, makeStyles } from '@material-ui/core';
import ActivityComponent from 'components/activity/ActivityComponent';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Feature } from 'geojson';
import { IPhoto } from 'components/photo/PhotoContainer';
import { MapContextMenuData } from '../map/MapContextMenu';

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
    width: '100%',
    zIndex: 0
  },
  formContainer: {},
  photoContainer: {}
}));

interface IReferencesActivityPage {
  classes?: any;
}

const ReferencesActivityPage: React.FC<IReferencesActivityPage> = (props) => {
  const urlParams = useParams();

  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  //const [contextMenuState, setContextMenuState] = useState({ isOpen: false });
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  /* commented out for sonar cloud, but this will be needed to close the context menu for this page:
  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };
  */
  const [doc, setDoc] = useState(null);

  const [photos, setPhotos] = useState<IPhoto[]>([]);

  useEffect(() => {
    const getActivityData = async () => {
      const activityResults = await databaseContext.database.find({ selector: { _id: urlParams['id'] } });

      // TODO these are cached activities, so do we really have an extent to set? Or are we just zooming to where the geometry is?
      setGeometry(activityResults.docs[0].geometry);
      setPhotos(activityResults.docs[0].photos);
      setDoc(activityResults.docs[0]);
    };

    getActivityData();
  }, [databaseChangesContext, databaseContext.database, urlParams]);

  if (!doc) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <ActivityComponent
        classes={classes}
        activity={doc}
        mapId={doc._id}
        photoState={{ photos, setPhotos }}
        showDrawControls={false}
        geometryState={{ geometry, setGeometry }}
        inputExtentState={{ extent, setExtent }}
        contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
      />
    </Container>
  );
};

export default ReferencesActivityPage;
