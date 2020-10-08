import { CardMedia, Fab, Grid, Paper, SvgIcon } from '@material-ui/core';
import { AddAPhoto, DeleteForever, SettingsSystemDaydreamTwoTone } from '@material-ui/icons';

import { useCamera } from '@ionic/react-hooks/camera';
import { CameraResultType, CameraSource, CameraPhoto, Capacitor, FilesystemDirectory } from '@capacitor/core';
import { isPlatform } from '@ionic/react';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';

import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useState, useContext, useEffect } from 'react';

import {
  ActivityStatus,
} from 'constants/activities'

interface Photo {
  filepath: string;
  webviewPath?: string;
  base64?: string;
}

interface IPhotoContainerProps {
  classes?: any;
  activity?: any;
}

const PhotoContainer: React.FC<IPhotoContainerProps> = (props) => {
  const { getPhoto } = useCamera();
  const { deleteFile, getUri, readFile, writeFile } = useFilesystem();
  const activityId = props.activity._id;

  const [photos, setPhotos] = useState<Photo[]>([]);

  const databaseContext = useContext(DatabaseContext);

  const initPhotos = async function (activityDoc: any) {
    const dbDoc = await databaseContext.database.get(activityDoc._id)
    
    const dbPhotos = dbDoc.photos != undefined ? dbDoc.photos : [];

    console.log("initData(doc): dbPhotos.length = " + dbPhotos.length);

    setPhotos(dbPhotos);

    console.log("initData(doc): photos.length = " + photos.length);
  }

  const updateDB = async function (activityDoc: any) {
    console.log("updateDB(doc): new photos.length = " + photos.length);

    await databaseContext.database.upsert(activityDoc._id, (activityDoc) => {
      return { ...activityDoc, photos: photos, status: ActivityStatus.EDITED, dateUpdated: new Date() };
    });
  }

  const takePhoto = async (doc: any) => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 100
    });

    console.log("takePhoto(doc): doc = " + doc);
    console.dir(doc);
    if (!doc.photos) {
      console.log("takePhoto(doc): doc.photos = null");
    } else {
      console.log("takePhoto(doc): doc.photos.length = " + doc.photos.length);
    }
    console.log("takePhoto(doc): photos.length = " + photos.length);

    const fileName = new Date().getTime() + '.jpeg';

    const photo = {
      filepath: fileName,
      base64: "data:image/jpeg;base64," + cameraPhoto.base64String
    };

    const newPhotos = [photo, ...photos];
    setPhotos(newPhotos);
    console.log("takePhoto(doc): newPhotos.length = " + newPhotos.length);
    console.dir(newPhotos);
    console.log("takePhoto(doc): new photos.length = " + photos.length);
  };

  const deletePhotos = async (doc: any) => {
    setPhotos([]);
  };

  const deletePhoto = async (filepath: any) => {
    console.log("deletePhoto(): filepath = " + filepath);

    const reducedPhotos = photos.filter((photo) => photo.filepath != filepath);

    console.log("deletePhoto(): photos.length = " + photos.length);
    console.log("deletePhoto(): reducedPhotos.length = " + reducedPhotos.length);

    setPhotos(reducedPhotos);
  };

  useEffect(() => {
    if (props && databaseContext.database) {
      initPhotos(props.activity);
    }
  }, [props]);

  useEffect(() => {
    if (props && databaseContext.database) {
      updateDB(props.activity);
    }
  }, [photos]);



  // Grid with overlays: https://material-ui.com/components/grid-list/
  return (
    <div>
      <div style={{ display: 'flex', flex: '1' }}>
        <Grid container>
          {photos.map((photo, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Paper>
                <CardMedia src={photo.base64 ?? photo.webviewPath} component="img" />
                <div style={{ cursor: 'pointer' }} onClick={() => deletePhoto(photo.filepath)}><SvgIcon component={DeleteForever} /> {photo.filepath}</div>
              </Paper>
            </Grid>
            ))
          }
        </Grid>
      </div>
      <div>
        <Grid container spacing={3} justify="center">
          <Grid item>
            <Fab color="primary" onClick={() => takePhoto(props.activity)}>
              <SvgIcon component={AddAPhoto} />
            </Fab>
          </Grid>
          <Grid item>
            <Fab onClick={() => deletePhotos(props.activity)}>
              <SvgIcon component={DeleteForever} />
            </Fab>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default PhotoContainer;
