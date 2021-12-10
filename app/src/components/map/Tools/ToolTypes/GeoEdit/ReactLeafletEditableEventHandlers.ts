import { IMapRecordsContext } from 'contexts/MapRecordsContext';
import { Circle } from 'react-leaflet';

export enum Shape {
  CIRCLE = 'CIRCLE',
  RECTANGLE = 'RECTANGLE',
  POLYGON = 'POLYGON',
  POLYLINE = 'POLYLINE',
  CIRCLE_MARKER = 'CIRCLE_MARKER'
}

export const startBasicShape = (mapRecordsContext: IMapRecordsContext, shape: Shape) => {
  try {
    console.log('starting ' + shape);
    const getGeoOnDisable = (e, m) => {
      if (shape !== Shape.CIRCLE) {
        mapRecordsContext.setCurrentGeoEdit(e.layer.toGeoJSON());
      } else {
        const r = e.layer.getRadius();
        const geo = e.layer.toGeoJSON();
        mapRecordsContext.setCurrentGeoEdit({ ...geo, properties: { ...geo.properties, radius: r } });
      }
    };
    mapRecordsContext.setLeafletEditableHandlers({
      ...mapRecordsContext.leafletEditableHandlers,
      onDisable: getGeoOnDisable
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
      case Shape.CIRCLE_MARKER:
        mapRecordsContext.editRef.current.startMarker();
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
