import { CircularProgress, Container, makeStyles } from '@material-ui/core';
import ActivityComponent from 'components/activity/ActivityComponent';
import { Feature } from 'geojson';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContextMenuData } from '../map/MapPageControls';

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

interface ISearchActivityPage {
  classes?: any;
}

const SearchActivityPage: React.FC<ISearchActivityPage> = (props) => {
  const urlParams = useParams();

  const classes = useStyles();

  const invasivesApi = useInvasivesApi();

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);
  const [contextMenuState, setContextMenuState] = useState<MapContextMenuData>({ isOpen: false, lat: 0, lng: 0 });

  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const getActivityData = async () => {
      const response = await invasivesApi.getActivityById(urlParams['id']);

      if (!response) {
        // TODO error messagign
      }

      const photos = [];
      if (response.media_keys && response.media_keys.length) {
        try {
          const mediaResults = await invasivesApi.getMedia(response.media_keys);

          mediaResults.forEach((media) => {
            photos.push({ filepath: media.file_name, dataUrl: media.encoded_file });
          });
        } catch {
          // TODO handle errors appropriately
        }
      }

      const activity = {
        _id: String(response.activity_id),
        activityType: response.activity_type,
        activitySubtype: response.activity_subtype,
        geometry: response.activity_payload.geometry,
        formData: response.activity_payload.form_data,
        photos: photos
      };

      // TODO these are search result activities (online only), so do we really have an extent to set? Or are we just zooming to where the geometry is?
      setGeometry(activity.geometry);
      setDoc(activity);
    };

    getActivityData();
  }, []);

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
        contextMenuState={{ state: contextMenuState, setContextMenuState }}
      />
    </Container>
  );
};

export default SearchActivityPage;
