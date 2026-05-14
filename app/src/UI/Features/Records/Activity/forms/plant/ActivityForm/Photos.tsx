import { Camera, MediaTypeSelection, MediaResult } from '@capacitor/camera';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import { useDispatch } from 'utils/use_selector';
import 'UI/Features/Records/Activity/PhotoContainer.css';
import Alerts from 'state/actions/alerts/Alerts';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import { get, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import Photo from './Photo';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { maxArrayLength } from 'UI/Features/Records/Activity/forms/common/validators';
import { useEffect } from 'react';

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

  const checkPermissionsAndAlert = async (photoOption: 'Photo Gallery' | 'Camera'): Promise<void> => {
    const permissions = await Camera.checkPermissions();
    if (permissions.camera !== 'denied') return;
    alertAccessWasDenied(photoOption);
  };

  const transformImageToFormData = (photo: MediaResult, index = 0): UploadedPhoto => {
    const fileName = `${new Date().toISOString().slice(0, 10)}-${index}.${photo.metadata?.format}`;
    const dataUrl = `data:image/${photo.metadata?.format};base64,${photo.thumbnail}`;
    return {
      file_name: fileName,
      encoded_file: dataUrl,
      description: `Untitled.${photo.metadata?.format}`
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
      append(transformImageToFormData(result));
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
      processedPhotos.filter(Boolean).forEach((p) => append(p));
    } catch (e) {
      console.error(e);
    }
  };

  const {
    control,
    formState: { disabled, errors },
    trigger
  } = useFormContext<FormSchema>();

  // Setup FieldArray for push/pop/watch
  const { fields, append, remove } = useFieldArray<FormSchema>({
    control,
    name: 'media',
    rules: { validate: (arr) => maxArrayLength(arr, 5) }
  });

  // useFieldArray won't watch internal changes, so use watch to capture
  const watchedMedia = useWatch<FormSchema>({
    control,
    name: 'media',
    defaultValue: fields // fallback to initial fields
  });
  const dispatch = useDispatch();

  useEffect(() => {
    trigger('media');
  }, [watchedMedia]);

  if (!fields) {
    return <section id="photo-cont">No Images found for Record</section>;
  }
  return (
    <section id="photo-cont">
      <h2>Photos</h2>
      <p>
        <ErrorMessage error={get(errors, 'media')?.root} />
      </p>
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
  );
};

export default Photos;
