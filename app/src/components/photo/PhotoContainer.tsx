//import { CameraResultType, CameraSource } from '@capacitor/core';
import { CameraResultType, CameraSource, Camera } from '@capacitor/camera';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardMedia,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  TextField
} from '@mui/material';
import { AddAPhoto, DeleteForever } from '@mui/icons-material';
import React from 'react';

export interface IPhoto {
  filepath: string;
  webviewPath?: string;
  base64?: string;
  dataUrl?: string;
  description?: string;
}

export interface IPhotoContainerProps {
  classes?: any;
  photoState: { photos: IPhoto[]; setPhotos: (photo: IPhoto[]) => void };
  isDisabled?: boolean;
}

const PhotoContainer: React.FC<IPhotoContainerProps> = (props) => {
  const takePhoto = async () => {
    try {
      const cameraPhoto = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100
      });

      const fileName = new Date().getTime() + '.' + cameraPhoto.format;
      const photo = {
        filepath: fileName,
        dataUrl: cameraPhoto.dataUrl,
        description: 'text'
      };

      props.photoState.setPhotos([...props.photoState.photos, photo]);
    } catch (e) {
      console.log('user cancelled or other camera problem');
      console.log(JSON.stringify(e));
    }
  };

  const changePhotoDescription = (filepath: any, fieldsToUpdate: Object) => {
    const oldPhoto = props.photoState.photos.find((photo) => photo.filepath === filepath);
    const otherPhotos = props.photoState.photos.filter((photo) => photo.filepath !== filepath);
    const updatedPhoto = { ...oldPhoto, ...fieldsToUpdate };
    props.photoState.setPhotos([...otherPhotos, updatedPhoto] as any);
  };

  const deletePhotos = async () => {
    props.photoState.setPhotos([]);
  };

  const deletePhoto = async (filepath: any) => {
    const reducedPhotos = props.photoState.photos.filter((photo) => photo.filepath !== filepath);
    props.photoState.setPhotos(reducedPhotos);
  };

  if (!props.photoState) {
    return <CircularProgress />;
  }

  return (
    <Box width={1}>
      <Box mb={3}>
        <Grid container>
          <Grid container item>
            {props.photoState.photos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <CardMedia src={photo.dataUrl} component="img" />
                  {!props.isDisabled && (
                    <CardActions>
                      <IconButton onClick={() => deletePhoto(photo.filepath)}>
                        <DeleteForever />
                      </IconButton>
                    </CardActions>
                  )}
                  <FormControl>
                    {photo.description}
                    <TextField
                      label="Change Description"
                      onBlur={(e) => changePhotoDescription(photo.filepath, { description: e.target.value })}
                    />
                    <Button>Save</Button>
                  </FormControl>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Box>
      {!props.isDisabled && (
        <Box>
          <Grid container>
            <Grid container item spacing={3} justifyContent="center">
              <Grid item>
                <Button variant="contained" color="primary" startIcon={<AddAPhoto />} onClick={() => takePhoto()}>
                  Add A Photo
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" startIcon={<DeleteForever />} onClick={() => deletePhotos()}>
                  Remove All Photos
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PhotoContainer;
