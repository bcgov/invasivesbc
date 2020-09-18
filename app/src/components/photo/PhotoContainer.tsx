import { CardMedia, Fab, Grid, Paper, SvgIcon } from '@material-ui/core';
import { AddAPhoto, DeleteForever } from '@material-ui/icons';
import { usePhotoGallery } from 'hooks/usePhotoGallery';
import React from 'react';

const PhotoContainer: React.FC = () => {
  const { photos, takePhoto, deletePhotos } = usePhotoGallery();

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
      <div style={{ height: '200px' }}>
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
