import { Camera, MediaResult, MediaTypeSelection } from '@capacitor/camera';
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
  TextField,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { PhotoCamera, PhotoLibrary, DeleteForever } from '@mui/icons-material';
import React, { useState } from 'react';
import Activity from 'state/actions/activity/Activity';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import { useDispatch, useSelector } from 'utils/use_selector';
import 'UI/Features/Records/Activity/PhotoContainer.css';
import Alerts from 'state/actions/alerts/Alerts';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
export interface IPhoto {
  file_name: string;
  webviewPath?: string;
  base64?: string;
  dataUrl?: string;
  description?: string;
  editing?: boolean;
}

export interface IPhotoContainerProps {
  classes?: any;
  isDisabled?: boolean;
}

const PhotoContainer: React.FC<IPhotoContainerProps> = (props) => {
  const dispatch = useDispatch();
  const media = useSelector((state) => state.ActivityPage.activity?.media || []);

  const checkPermissionsAndAlert = async (permission: 'Photo Gallery' | 'Camera'): Promise<void> => {
    const { camera, photos } = await Camera.checkPermissions();
    if ((permission == 'Camera' && camera === 'denied') || (permission === 'Photo Gallery' && photos === 'denied')) {
      dispatch(
        Alerts.create({
          content: 'Camera access is denied. Please enable camera permissions in your device settings to take photos.',
          severity: AlertSeverity.Warning,
          subject: AlertSubjects.Photo,
          autoClose: 5
        })
      );
    }
  };

  const transformImageToFormData = (photo: MediaResult, index = 0): UploadedPhoto => {
    const fileName = `${new Date().toISOString().slice(0, 10)}-${index}.${photo.metadata?.format}`;
    const dataUrl = `data:image/${photo.metadata?.format};base64,${photo.thumbnail}`;
    return {
      file_name: fileName,
      encoded_file: dataUrl,
      description: `Untitled.${photo.metadata?.format}`,
      editing: false
    } as UploadedPhoto;
  };

  const takePhotoFromCamera = async () => {
    try {
      await checkPermissionsAndAlert('Camera');
      const result = await Camera.takePhoto({
        presentationStyle: 'fullscreen',
        quality: 75,
        includeMetadata: true
      });
      dispatch(Activity.Photo.add(transformImageToFormData(result)));
    } catch (e) {
      console.error(e);
    }
  };

  const choosePhotosFromLibrary = async () => {
    try {
      await checkPermissionsAndAlert('Photo Gallery');
      const { results } = await Camera.chooseFromGallery({
        mediaType: MediaTypeSelection.Photo,
        includeMetadata: true,
        allowMultipleSelection: true,
        limit: 5,
        quality: 75
      });
      const processedPhotos = results.map(transformImageToFormData);
      // filter out failed photo conversions
      processedPhotos.filter(Boolean).forEach((p) => dispatch(Activity.Photo.add(p)));
    } catch (e) {
      console.error(e);
    }
  };

  const deletePhoto = async (photo: UploadedPhoto) => {
    dispatch(Activity.Photo.delete(photo));
  };

  const [newPhotoDesc, setNewPhotoDesc] = useState('untitled');

  if (!media) {
    return <CircularProgress />;
  }

  return (
    <Box width={1}>
      <Box mb={3}>
        <Grid container>
          <Grid container>
            {media.map((photo, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                <Card>
                  <CardMedia src={photo.encoded_file} component="img" />
                  <Typography style={{ marginTop: '15px' }} textAlign={'center'} variant="h5">
                    {photo.description}
                  </Typography>
                  {!props.isDisabled && (
                    <CardActions style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
                      <IconButton onClick={() => deletePhoto(photo)}>
                        <DeleteForever />
                      </IconButton>
                      <IconButton
                        disabled={photo.editing}
                        onClick={() => {
                          dispatch(Activity.Photo.edit({ ...photo, editing: true }));
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </CardActions>
                  )}

                  <FormControl>
                    {photo.editing && (
                      <>
                        <TextField
                          label="Change Description"
                          onChange={(e) => {
                            setNewPhotoDesc(e.target.value);
                          }}
                        />
                        <Button
                          onClick={() => {
                            dispatch(Activity.Photo.edit({ ...photo, description: newPhotoDesc, editing: false }));
                            setNewPhotoDesc('untitled');
                          }}
                        >
                          Save
                        </Button>
                      </>
                    )}
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
            <Grid container spacing={3} justifyContent="center">
              <Grid>
                <Button variant="contained" color="primary" startIcon={<PhotoCamera />} onClick={takePhotoFromCamera}>
                  Capture Photo
                </Button>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PhotoLibrary />}
                  onClick={choosePhotosFromLibrary}
                >
                  Choose from Gallery
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
