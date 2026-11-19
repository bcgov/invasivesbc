import { Camera, MediaResult, MediaTypeSelection } from '@capacitor/camera';
import { nanoid } from '@reduxjs/toolkit';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import Alerts from 'state/actions/alerts/Alerts';

export const alertAccessWasDenied = (type: string) =>
  Alerts.create({
    content: `${type} access is denied. Please enable photo library permissions in your device settings to choose photos.`,
    severity: AlertSeverity.Warning,
    subject: AlertSubjects.Photo,
    autoClose: 5
  });

export const checkPermissionsAndAlert = async (photoOption: 'Photo Gallery' | 'Camera'): Promise<void> => {
  const permissions = await Camera.checkPermissions();
  if (permissions.camera !== 'denied') return;
  alertAccessWasDenied(photoOption);
};

export const transformImageToFormData = (photo: MediaResult): UploadedPhoto => {
  const fileName = `${new Date().toISOString().slice(0, 10)}-${nanoid()}.${photo.metadata?.format}`;
  const dataUrl = `data:image/${photo.metadata?.format};base64,${photo.thumbnail}`;
  return {
    file_name: fileName,
    encoded_file: dataUrl,
    description: `Untitled.${photo.metadata?.format}`,
    editing: false
  } as UploadedPhoto;
};

export const takePhotoFromCamera = async () => {
  try {
    await checkPermissionsAndAlert('Camera');
    const result = await Camera.takePhoto({
      presentationStyle: 'fullscreen',
      quality: 75,
      includeMetadata: true
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

export const chooseMediaFromLibrary = async () => {
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
    return processedPhotos;
  } catch (e) {
    console.error(e);
  }
};
