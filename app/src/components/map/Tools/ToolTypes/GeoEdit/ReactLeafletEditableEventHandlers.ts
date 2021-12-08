import { IMapRecordsContext } from 'contexts/MapRecordsContext';

export const startPolygon = (mapRecordsContext: IMapRecordsContext) => {
  try {
    console.log('starting polygon');
    const getGeoOnDrawCommit = (e, m) => {
      mapRecordsContext.setCurrentGeoEdit(e.layer.toGeoJSON());
    };
    mapRecordsContext.setLeafletEditableHandlers({
      ...mapRecordsContext.leafletEditableHandlers,
      onEndDrawing: getGeoOnDrawCommit
    });
    mapRecordsContext.editRef.current.startPolygon();
    return true;
  } catch (e) {
    return false;
  }
};

export const startRectangle = (mapRecordsContext: IMapRecordsContext) => {
  try {
    console.log('starting startRectangle');
    const getGeoOnDrawCommit = (e, m) => {
      mapRecordsContext.setCurrentGeoEdit(e.layer.toGeoJSON());
    };
    mapRecordsContext.setLeafletEditableHandlers({
      ...mapRecordsContext.leafletEditableHandlers,
      onEndDrawing: getGeoOnDrawCommit
    });
    mapRecordsContext.editRef.current.startRectangle();
    return true;
  } catch (e) {
    return false;
  }
};

export const startCircle = (mapRecordsContext: IMapRecordsContext) => {
  try {
    console.log('starting circle');
    const getGeoOnDrawCommit = (e, m) => {
      mapRecordsContext.setCurrentGeoEdit(e.layer.toGeoJSON());
    };
    mapRecordsContext.setLeafletEditableHandlers({
      ...mapRecordsContext.leafletEditableHandlers,
      onEndDrawing: getGeoOnDrawCommit
    });
    mapRecordsContext.editRef.current.startCircle();
    return true;
  } catch (e) {
    return false;
  }
};

export const startPolyline = (mapRecordsContext: IMapRecordsContext) => {
  try {
    console.log('starting polyline');
    const getGeoOnDrawCommit = (e, m) => {
      mapRecordsContext.setCurrentGeoEdit(e.layer.toGeoJSON());
    };
    mapRecordsContext.setLeafletEditableHandlers({
      ...mapRecordsContext.leafletEditableHandlers,
      onEndDrawing: getGeoOnDrawCommit
    });
    mapRecordsContext.editRef.current.startPolyline();
    return true;
  } catch (e) {
    return false;
  }
};

export const stopShape = (mapRecordsContext) => {
  console.log('stopping shape');
  mapRecordsContext.editRef.current.clearAll();
  return true;
};
