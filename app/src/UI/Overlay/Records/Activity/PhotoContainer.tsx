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
  TextField,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { AddAPhoto, DeleteForever } from '@mui/icons-material';
import React, { useState } from 'react';
import Activity from 'state/actions/activity/Activity';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import { useDispatch, useSelector } from 'utils/use_selector';

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
  //  photoState: { photos: IPhoto[]; setPhotos: (photo: IPhoto[]) => void };
  isDisabled?: boolean;
}

const PhotoContainer: React.FC<IPhotoContainerProps> = (props) => {
  const dispatch = useDispatch();
  const media = useSelector((state) => state.ActivityPage.activity?.media || []);

  const takePhoto = async () => {
    try {
      const cameraPhoto = await Camera.getPhoto({
        presentationStyle: 'fullscreen',
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100
      });

      const fileName = new Date().getTime() + '.' + cameraPhoto.format;
      const photo: UploadedPhoto = {
        file_name: fileName,
        encoded_file: cameraPhoto.dataUrl,
        description: 'untitled',
        editing: false
      };

      dispatch(Activity.Photo.add(photo));
      // props.photoState.setPhotos([...props.photoState.photos, photo]);
    } catch (e) {
      console.error('user cancelled or other camera problem', e);
    }
  };

  // const changePhotoDescription = (file_name: any, fieldsToUpdate: Object) => {
  //   const oldPhoto = props.photoState.photos.find((photo) => photo.file_name === file_name);
  //   const otherPhotos = props.photoState.photos.filter((photo) => photo.file_name !== file_name);
  //   const updatedPhoto = { ...oldPhoto, ...fieldsToUpdate };
  //   props.photoState.setPhotos([...otherPhotos, updatedPhoto] as any);
  // };

  // const deletePhotos = async () => {
  //   props.photoState.setPhotos([]);
  // };

  const deletePhoto = async (photo: UploadedPhoto) => {
    dispatch(Activity.Photo.delete(photo));
  };

  // const [editing, setEditing] = useState(false);
  const [newPhotoDesc, setNewPhotoDesc] = useState('untitled');
  // const editPhotoDesc = () => {
  //   if (editing === false) {
  //     setEditing(true);
  //   }
  // };

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
                <Button variant="contained" color="primary" startIcon={<AddAPhoto />} onClick={() => takePhoto()}>
                  Add A Photo
                </Button>
              </Grid>
              {/* <Grid item>
                <Button variant="contained" startIcon={<DeleteForever />} onClick={() => deletePhotos()}>
                  Remove All Photos
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PhotoContainer;
