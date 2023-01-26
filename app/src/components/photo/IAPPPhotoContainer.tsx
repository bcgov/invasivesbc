import { CameraResultType, CameraSource, Camera } from '@capacitor/camera';
import {
  Box,
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IAPP_GET_MEDIA_REQUEST } from 'state/actions';
import { selectIappsite } from 'state/reducers/iappsite';

export interface IPhoto {
  file_name: string;
  webviewPath?: string;
  base64?: string;
  dataUrl?: string;
  description?: string;
  editing?: boolean;
}

const PhotoContainer = (props) => {
  const iappSiteState = useSelector(selectIappsite);
  const dispatch = useDispatch();

  useEffect(() => {
    if (iappSiteState.IAPP) {
      console.log("grabbing media");
      dispatch({
        type: IAPP_GET_MEDIA_REQUEST
      });
    }
  }, []);

  if (!iappSiteState.media) {
    return <CircularProgress />;
  }

  return (
    <Box width={1}>
      <Box mb={3}>
        <Grid container>
          <Grid container item>
            {iappSiteState?.media?.map((photo:any, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <CardMedia src={photo.encoded_file} component="img" />
                  <Typography style={{ marginTop: '15px' }} textAlign={'center'} variant="h5">
                    {photo.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PhotoContainer;
