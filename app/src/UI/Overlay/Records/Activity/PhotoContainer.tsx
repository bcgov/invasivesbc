import { CameraResultType, CameraSource, Camera, Photo } from '@capacitor/camera';
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
import './PhotoContainer.css';
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

  const preparePhoto = (photoToProcess: Photo) => {
    const fileName = new Date().getTime() + '.' + photoToProcess.format;
    const photo: UploadedPhoto = {
      file_name: fileName,
      encoded_file: photoToProcess.dataUrl,
      description: 'untitled',
      editing: false
    };
    return photo;
  };

  async function convertWebPathToDataUrl(webPath: string): Promise<string> {
    const response = await fetch(webPath);

    // convert response into a blob
    const blob = await response.blob();

    // read the blob as a dataUrl
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string); // result is the dataUrl
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const checkPermissionsAndDisplayInfo = async (PhotoOption: CameraSource): Promise<void> => {
    try {
      const permissions = await Camera.checkPermissions();

      if (PhotoOption === CameraSource.Camera) {
        if (permissions.camera === 'denied') {
          alert('Camera access is denied. Please enable camera permissions in your device settings to take photos.');
        }
      }

      if (PhotoOption === CameraSource.Photos) {
        if (permissions.photos === 'denied') {
          alert(
            'Photo library access is denied. Please enable photo library permissions in your device settings to choose photos.'
          );
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const takePhotoFromCamera = async () => {
    try {
      await checkPermissionsAndDisplayInfo(CameraSource.Camera);
      const cameraPhoto = await Camera.getPhoto({
        presentationStyle: 'fullscreen',
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100
      });

      const photo = preparePhoto(cameraPhoto);
      dispatch(Activity.Photo.add(photo));
    } catch (e) {
      console.error('user cancelled or other camera problem', e);
    }
  };

  const chooseMultiplePhotosFromLibrary = async () => {
    try {
      await checkPermissionsAndDisplayInfo(CameraSource.Photos);
      const multiplePhotos = await Camera.pickImages({
        quality: 100,
        limit: 10
      });

      if (!multiplePhotos.photos.length) {
        console.log('No photos selected');
        return;
      }

      // process all photos concurrently
      const processedPhotos = await Promise.all(
        multiplePhotos.photos.map(async (photo, index) => {
          try {
            const fileName = `${new Date().getTime()}-${index}.${photo.format}`;
            const dataUrl = await convertWebPathToDataUrl(photo.webPath);

            return {
              file_name: fileName,
              encoded_file: dataUrl,
              description: 'untitled',
              editing: false
            } as UploadedPhoto;
          } catch (error) {
            console.error(`Error processing photo ${index + 1}:`, error);
            return null; // skip photo on failure
          }
        })
      );

      // filter out failed photo conversions
      const validPhotos = processedPhotos.filter((photo) => photo !== null);
      validPhotos.forEach((photo) => {
        if (photo) dispatch(Activity.Photo.add(photo));
      });
    } catch (e) {
      console.error('error occurred: ', e);
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
          <Grid container item>
            {media.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
            <Grid container item spacing={3} justifyContent="center">
              <Grid item>
                <Button variant="contained" color="primary" startIcon={<PhotoCamera />} onClick={takePhotoFromCamera}>
                  Capture Photo
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PhotoLibrary />}
                  onClick={chooseMultiplePhotosFromLibrary}
                >
                  Choose from Gallery
                </Button>
              </Grid>
            </Grid>
            {/* <>
              <Box mt={8}>
                <u>
                  <strong>To enable Camera and Photo permissions manually: </strong>
                </u>
              </Box>
              <Box mt={4}>
                <strong>To enable permissions: </strong> ....
              </Box>
            </> */}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PhotoContainer;
