import { Camera, MediaResult, MediaTypeSelection } from '@capacitor/camera';
import { Box, Button, CircularProgress, Grid } from '@mui/material';
import { PhotoCamera, PhotoLibrary } from '@mui/icons-material';
import Activity from 'state/actions/activity/Activity';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import { useDispatch, useSelector } from 'utils/use_selector';
import 'UI/Features/Records/Activity/PhotoContainer.css';
import Alerts from 'state/actions/alerts/Alerts';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import { Md5 } from 'ts-md5';
import Photo from './Photo';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { nanoid } from '@reduxjs/toolkit';

export interface IPhotoContainerProps {
  classes?: any;
  isDisabled?: boolean;
}

const PhotoContainer = (props: IPhotoContainerProps) => {
  const dispatch = useDispatch();
  const media = useSelector((state) => state.ActivityPage.activity?.media) ?? [];

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

  const transformImageToFormData = (photo: MediaResult): UploadedPhoto => {
    const fileName = `${new Date().toISOString().slice(0, 10)}-${nanoid()}.${photo.metadata?.format}`;
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
      // filter out failed photo conversions / twice-uploaded images
      processedPhotos.filter(Boolean).forEach((p) => {
        const hashed = Md5.hashStr(p.encoded_file ?? '');
        const isPhotoAlreadyUploaded = media.some((m) => Md5.hashStr(m.encoded_file) === hashed);
        if (isPhotoAlreadyUploaded) {
          dispatch(
            Alerts.create({
              content: `Selected image already in record. Image was removed.`,
              severity: AlertSeverity.Error,
              subject: AlertSubjects.Photo,
              autoClose: 8
            })
          );
        } else {
          dispatch(Activity.Photo.add(p));
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!media) {
    return <CircularProgress />;
  }
  return (
    <Box width={1}>
      <Box mb={3}>
        <Grid container>
          <Grid container>
            {media.map((photo) => (
              <Photo key={Md5.hashStr(photo.encoded_file)} photo={photo} isDisabled={props?.isDisabled} />
            ))}
          </Grid>
        </Grid>
      </Box>
      {!props.isDisabled && (
        <div>
          <MobileOnly>
            <Button variant="contained" color="primary" startIcon={<PhotoCamera />} onClick={takePhotoFromCamera}>
              Capture Photo
            </Button>
          </MobileOnly>

          <Button variant="contained" color="primary" startIcon={<PhotoLibrary />} onClick={choosePhotosFromLibrary}>
            Choose from Gallery
          </Button>
        </div>
      )}
    </Box>
  );
};

export default PhotoContainer;
