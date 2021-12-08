import { IMapRecordsContext } from 'contexts/MapRecordsContext';

export const startPolygon = (mapRecordsContext: IMapRecordsContext) => {
  try {
    console.log('starting polygon');
    //TODO - overrides go here
    const getGeoOnNewVertex = (e, m) => {
      console.log('event');
      console.dir(e);
      console.log('map');
      console.log(m);
      //mapRecordsContext.setCurrentGeoEdit
    };
    const getGeoOnDrawCommit = (e, m) => {
      console.log('event', e.layer.toGeoJSON());
      console.dir(e);
      console.log('map');
      console.log(m);
      //mapRecordsContext.setCurrentGeoEdit
    };
    const getGeoOnDisable = (e, m) => {
      console.log('event', e.layer.toGeoJSON());
    };
    mapRecordsContext.setLeafletEditableHandlers({
      ...mapRecordsContext.leafletEditableHandlers,
      onNewVertex: getGeoOnNewVertex,
      onEndDrawing: getGeoOnDrawCommit
    });
    mapRecordsContext.editRef.current.startPolygon();
    return true;
  } catch (e) {
    return false;
  }
};
export const stopPolygon = (mapRecordsContext) => {
  console.log('stopping polygon');
  mapRecordsContext.editRef.current.clearAll();
  return true;
};

const PolygonOnDrawCommit = (e, m) => {};
