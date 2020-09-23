import { CardMedia, Fab, Grid, Paper, SvgIcon } from '@material-ui/core';
import { AddAPhoto, DeleteForever } from '@material-ui/icons';
import { usePhotoGallery } from 'hooks/usePhotoGallery';
import React from 'react';

interface IPhotoContainerProps {
  classes?: any;
  activity?: any;
}

const PhotoContainer: React.FC<IPhotoContainerProps> = (props) => {
  const { photos, takePhoto, deletePhotos } = usePhotoGallery();

  // Grid with overlays: https://material-ui.com/components/grid-list/
  return (
    <div>
      <div style={{ display: 'flex', flex: '1' }}>
        <Grid container>
          {photos.map((photo, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Paper>
                <CardMedia src={photo.base64 ?? photo.webviewPath} component="img" />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
      <div>
        <Grid container spacing={3} justify="center">
          <Grid item>
            <Fab color="primary" onClick={() => takePhoto()}>
              <SvgIcon component={AddAPhoto} />
            </Fab>
          </Grid>
          <Grid item>
            <Fab onClick={() => deletePhotos()}>
              <SvgIcon component={DeleteForever} />
            </Fab>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default PhotoContainer;
