import { CameraResultType, CameraSource, Camera } from '@capacitor/camera';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import { useDispatch } from 'utils/use_selector';
import 'UI/Features/Records/Activity/PhotoContainer.css';
import Alerts from 'state/actions/alerts/Alerts';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { FormSchema } from '../interfaces';
import Photo from './Photo';

const Photos = () => {
  const alertAccessWasDenied = (type: string) =>
    dispatch(
      Alerts.create({
        content: `${type} access is denied. Please enable photo library permissions in your device settings to choose photos.`,
        severity: AlertSeverity.Warning,
        subject: AlertSubjects.Photo,
        autoClose: 5
      })
    );

  async function convertWebPathToDataUrl(webPath: string): Promise<string> {
    const response = await fetch(webPath);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string); // result is a dataUrl
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const checkPermissionsAndAlert = async (photoOption: CameraSource): Promise<void> => {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'denied') return;
      if (photoOption === CameraSource.Camera) {
        alertAccessWasDenied('Camera');
      } else if (photoOption === CameraSource.Photos) {
        alertAccessWasDenied('Photo Library');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };
  const takePhotoFromCamera = async () => {
    try {
      await checkPermissionsAndAlert(CameraSource.Camera);
      const cameraPhoto = await Camera.getPhoto({
        presentationStyle: 'fullscreen',
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100
      });

      const fileName = new Date().toISOString().slice(0, 10) + '.' + cameraPhoto.format;
      const photo = {
        file_name: fileName,
        encoded_file: cameraPhoto.dataUrl,
        description: 'Untitled'
      } as UploadedPhoto;

      append(photo);
    } catch (e) {
      console.error('User cancelled prematurely or other problem occured.', e);
    }
  };

  const choosePhotosFromLibrary = async () => {
    try {
      await checkPermissionsAndAlert(CameraSource.Photos);
      const multiplePhotos = await Camera.pickImages({
        quality: 100,
        limit: 10
      });

      if (!multiplePhotos.photos.length) {
        console.warn('No photos selected');
        return;
      }

      // process all photos concurrently
      const processedPhotos = await Promise.all(
        multiplePhotos.photos.map(async (photo, index) => {
          try {
            const fileName = `${new Date().toISOString().slice(0, 10)}-${index}.${photo.format}`;
            const dataUrl = await convertWebPathToDataUrl(photo.webPath);

            return {
              file_name: fileName,
              encoded_file: dataUrl,
              description: 'Untitled'
            } as UploadedPhoto;
          } catch (error) {
            console.error(`Error processing photo ${index + 1}:`, error);
            return null; // skip photo on failure
          }
        })
      );

      // filter out failed photo conversions
      const validPhotos = processedPhotos.filter((photo) => photo != null);
      validPhotos.forEach((photo) => append(photo));
    } catch (e) {
      console.error('error occurred: ', e);
    }
  };

  const {
    control,
    formState: { disabled }
  } = useFormContext<FormSchema>();

  // Setup FieldArray for push/pop/watch
  const { fields, append, remove } = useFieldArray<FormSchema>({ control, name: 'media' });

  // useFieldArray won't watch internal changes, so use watch to capture
  const watchedMedia = useWatch<FormSchema>({
    control,
    name: 'media',
    defaultValue: fields // fallback to initial fields
  });
  const dispatch = useDispatch();

  if (!fields) {
    return <section id="photo-cont">No Images found for Record</section>;
  }
  return (
    <>
      <section id="photo-cont">
        <h2>Photos</h2>
        <div className="content">
          {watchedMedia.map((photo, index: number) => (
            <Photo key={photo.id} photo={photo} index={index} remove={() => remove(index)} />
          ))}
        </div>
        <div className="control">
          <input
            type="button"
            className="control-button"
            disabled={disabled}
            onClick={takePhotoFromCamera}
            value={'Capture Photo'}
          />
          <input
            type="button"
            className="control-button"
            disabled={disabled}
            onClick={choosePhotosFromLibrary}
            value="Choose from Gallery"
          />
        </div>
      </section>
    </>
  );
};

export default Photos;
