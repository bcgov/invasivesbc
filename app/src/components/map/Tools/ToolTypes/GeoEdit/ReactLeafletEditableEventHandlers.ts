import { IMapRecordsContext } from 'contexts/MapRecordsContext';
import { Circle } from 'react-leaflet';

export enum Shape {
  CIRCLE = 'CIRCLE',
  RECTANGLE = 'RECTANGLE',
  POLYGON = 'POLYGON',
  POLYLINE = 'POLYLINE'
}

export const startBasicShape = (mapRecordsContext: IMapRecordsContext, shape: Shape) => {
  try {
    console.log('starting ' + shape);
    const getGeoOnDrawCommit = (e, m) => {
      mapRecordsContext.setCurrentGeoEdit(e.layer.toGeoJSON());
    };
    mapRecordsContext.setLeafletEditableHandlers({
      ...mapRecordsContext.leafletEditableHandlers,
      onEndDrawing: getGeoOnDrawCommit
    });
    switch (shape) {
      case Shape.CIRCLE:
        mapRecordsContext.editRef.current.startCircle();
        break;
      case Shape.RECTANGLE:
        mapRecordsContext.editRef.current.startRectangle();
        break;
      case Shape.POLYGON:
        mapRecordsContext.editRef.current.startPolygon();
        break;
      case Shape.POLYLINE:
        mapRecordsContext.editRef.current.startPolyline();
        break;
      default:
        break;
    }
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
