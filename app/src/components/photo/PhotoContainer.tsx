import { CardMedia, Fab, Grid, Paper, SvgIcon } from '@material-ui/core';
import { AddAPhoto, DeleteForever } from '@material-ui/icons';
import { useCamera } from '@ionic/react-hooks/camera';
import { CameraResultType, CameraSource } from '@capacitor/core';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useState, useContext, useEffect } from 'react';

import {
  ActivityStatus,
} from 'constants/activities'
import { fileURLToPath } from 'url';

interface Photo {
  filepath: string;
  webviewPath?: string;
  base64?: string;
  dataUrl?: string;
}

interface IPhotoContainerProps {
  classes?: any;
  activity?: any;
}

const PhotoContainer: React.FC<IPhotoContainerProps> = (props) => {
  const { getPhoto } = useCamera();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const databaseContext = useContext(DatabaseContext);

  const initPhotos = async function (activityDoc: any) {
    const dbDoc = await databaseContext.database.get(activityDoc._id)
    const dbPhotos = dbDoc.photos || [];
    setPhotos(dbPhotos);
  }

  const updateDB = async function (activityDoc: any) {
    await databaseContext.database.upsert(activityDoc._id, (doc) => {
      return { ...doc, photos: photos, status: ActivityStatus.EDITED, dateUpdated: new Date() };
    });
  }

  const takePhoto = async (doc: any) => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100
    });

    console.log("cameraPhoto object");
    console.dir(cameraPhoto);

    const fileName = new Date().getTime() + "." + cameraPhoto.format;
    const photo = {
      filepath: fileName,
      dataUrl: cameraPhoto.dataUrl
    };

    const newPhotos = [photo, ...photos];
    setPhotos(newPhotos);
  };

  const deletePhotos = async (doc: any) => {
    setPhotos([]);
  };

  const deletePhoto = async (filepath: any) => {

    const reducedPhotos = photos.filter((photo) => photo.filepath != filepath);
    setPhotos(reducedPhotos);
  };

  useEffect(() => {
    if (props) {
      initPhotos(props.activity);
    }
  }, [props]);

  useEffect(() => {
    if (props) {
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
                <CardMedia src={photo.dataUrl} component="img" />
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
