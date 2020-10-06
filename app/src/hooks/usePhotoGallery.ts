import { useState, useEffect, useContext } from 'react';
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import { CameraResultType, CameraSource, CameraPhoto, Capacitor, FilesystemDirectory } from '@capacitor/core';
import { DatabaseContext } from 'contexts/DatabaseContext';

import {
  ActivityStatus,
} from 'constants/activities'

//This is the key in the filesystem
const PHOTO_STORAGE = 'photos';

export function usePhotoGallery(activity: any) {
  const { getPhoto } = useCamera();
  console.log('used camera');
  const databaseContext = useContext(DatabaseContext);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { deleteFile, getUri, readFile, writeFile } = useFilesystem();
  const { get, set, clear } = useStorage();





  useEffect(() => {
    const loadSaved = async () => {
      const photosString = await get('photos');
      console.log("Photostring: " + photosString);
      const photosInStorage = (photosString ? JSON.parse(photosString) : [...photos]) as Photo[];
      console.log("PhotosInstorage: " + photosInStorage);
      // If running on the web...
      if (!isPlatform('hybrid')) {
        for (let photo of photosInStorage) {
          const file = await readFile({
            path: photo.filepath,
            directory: FilesystemDirectory.Data
          });
          // Web platform only: Save the photo into the base64 field
          photo.base64 = `data:image/jpeg;base64,${file.data}`;
        }
      }
      setPhotos(photosInStorage);
    };
    loadSaved();
  }, [get, readFile]);

  const takePhoto = async (doc: any) => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    console.log("takePhoto(doc): doc = " + JSON.stringify(doc));

    const fileName = new Date().getTime() + '.jpeg';
    const photo = await convert2Photo(cameraPhoto, fileName);

    
    //const newPhotos = [savedFileImage, ...photos];
    const newPhotos = [photo, ...photos];
    setPhotos(newPhotos);

    await databaseContext.database.upsert(doc._id, (activityDoc) => {
      return { ...activityDoc, photos: newPhotos, status: ActivityStatus.EDITED, dateUpdated: new Date() };
    });

    set(
      PHOTO_STORAGE,
      isPlatform('hybrid')
        ? JSON.stringify(newPhotos)
        : JSON.stringify(
            newPhotos.map((p) => {
              // Don't save the base64 representation of the photo data,
              // since it's already saved on the Filesystem
              const photoCopy = { ...p };
              delete photoCopy.base64;
              return photoCopy;
            })
          )
    );
  };
  
  const convert2Photo = async (cameraPhoto: CameraPhoto, filepath: string): Promise<Photo> => {
    let webviewPath: string;
    let base64: string;

    webviewPath = cameraPhoto.webPath;

    // "hybrid" will detect Cordova or Capacitor;
    if (isPlatform('hybrid')) {
      const file = await readFile({
        path: cameraPhoto.path!
      });
      base64 = file.data;
    } else {
      base64 = await base64FromPath(cameraPhoto.webPath!);
    }

    return {
      filepath: filepath,
      webviewPath: webviewPath,
      base64: base64
    };
  };

  const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
    let base64Data: string;
    // "hybrid" will detect Cordova or Capacitor;
    if (isPlatform('hybrid')) {
      const file = await readFile({
        path: photo.path!
      });
      base64Data = file.data;
    } else {
      base64Data = await base64FromPath(photo.webPath!);
    }
    const savedFile = await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    console.log('Photo saved to file system with path: ' + fileName);

    if (isPlatform('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri)
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }
  };

  const deletePhotos = async () => {
    try{
      const photosString = await get('photos');
      const photosInStorage = (photosString ? JSON.parse(photosString) : []) as Photo[];
      console.log("inside deletePhotos");
      console.dir(photosString);
      console.dir(photosInStorage);
  
      console.log('Deleting photos from file system:');
      for (let photo of photosInStorage) {
        console.log('Deleting photo with path: ' + photo.filepath);
        console.dir(photo);
  
        // delete photo from file system
        const fileDeleted = await deleteFile({
          path: photo.filepath
        });
      }      // clear photos from storage
    console.log('Clear photos from the filesystem');
    clear();
    console.dir(photosInStorage);

    // clear photo array from useState
    console.log('Clear photos from the useState');
    setPhotos([]);
    console.dir(photosInStorage);
    } catch(error){
      console.log(error);
    }
  };

  return {
    photos,
    takePhoto,
    deletePhotos
  };
}

export interface Photo {
  filepath: string;
  webviewPath?: string;
  base64?: string;
}
