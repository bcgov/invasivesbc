import PQueue from 'p-queue';
import * as React from 'react';

// A place for the app to track what records are passed to map & which are selected
// or being edited.  To be used for spatial select, filtering and editing

// keep scrolling for comments on what each is for
export interface IMapRecordsContext {
  currentGeoEdit?: any;
  setCurrentGeoEdit?: React.Dispatch<React.SetStateAction<any>>;
  onEachFeature?: any;
  setOnEachFeature?: React.Dispatch<React.SetStateAction<any>>;
  editRef?: any;
  setEditRef?: React.Dispatch<React.SetStateAction<any>>;
  editQueue?: any;
  setLeafletEditableHandlers?: React.Dispatch<React.SetStateAction<any>>;
  leafletEditableHandlers?: any;
}
export enum MAP_RECORD_TYPE {
  ACTIVITY = 'activity',
  REF_ACTIVITY = 'ref activity',
  POI = 'POI',
  KMZ_OR_KML_DATA = 'kmz/kml'
}

export interface MapRecord {
  id: string;
  short_id?: string;
  type: MAP_RECORD_TYPE;
  editable: boolean;
  onSave: () => {};
  geometry: Object;
}

export const MapRecordsContext = React.createContext<IMapRecordsContext>({
  // style callback
  onEachFeature: () => {},
  setOnEachFeature: () => {},

  // place to track current geo being edited
  // independant of records and selectedRecords (depending on how controlling comp works)
  currentGeoEdit: null,
  setCurrentGeoEdit: () => {},

  // all to support react-leaflet editable
  editRef: null,
  setEditRef: () => {},
  editQueue: null,
  setLeafletEditableHandlers: () => {},
  leafletEditableHandlers: null
});

export enum MODES {
  DEFAULT = 'default',
  SINGLE_ACTIVITY_EDIT = 'single activity edit',
  dropNewRecord = 'drop new record'
}

export const MapRecordsContextProvider: React.FC = (props) => {
  const [mode, setMode] = React.useState(null);
  const [currentGeoEdit, setCurrentGeoEdit] = React.useState(null);
  const [editRef, setEditRef] = React.useState(null);
  const [editQueue, setEditQueue] = React.useState(null);
  const [leafletEditableHandlers, setLeafletEditableHandlers] = React.useState(null);

  React.useEffect(() => {
    let handler: any = {};
    const EDITABLE_EVENT_DEBUG = false;
    if (!leafletEditableHandlers) {
      // some placeholder handlers for when people are chasing their tail
      handler.onShapeDelete = (e, m) => {
        if (EDITABLE_EVENT_DEBUG) {
          console.log('onShapeDelete');
        }
      };
    }
    handler.onShapeDeleted = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onShapeDeleted');
      }
    };
    handler.onEditing = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onEditing');
      }
    };
    handler.onEnable = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onEnable');
      }
    };
    handler.onDisable = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDisable');
      }
    };
    handler.onStartDrawing = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onStartDrawing');
      }
    };
    handler.onDrawingClick = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDrawingClick');
      }
    };
    handler.onEndDrawing = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onEndDrawing');
      }
    };
    handler.onDrawingCommit = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDrawingCommit');
      }
    };
    handler.onDrawingMouseDown = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDrawingMouseDown');
      }
    };
    handler.onDrawingMouseUp = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDrawingMouseUp');
      }
    };
    handler.onDrawingMove = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDrawingMove');
      }
    };
    handler.onCancelDrawing = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onCancelDrawing');
      }
    };
    handler.onDragStart = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDragStart');
      }
    };
    handler.onDrag = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDrag');
      }
    };
    handler.onDragEnd = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onDragEnd');
      }
    };
    handler.onVertexMarkerDrag = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerDrag');
      }
    };
    handler.onVertexMarkerDragStart = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerDragStart');
      }
    };
    handler.onVertexMarkerDragEnd = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerDragEnd');
      }
    };
    handler.onVertextCtrlClick = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertextCtrlClick');
      }
    };
    handler.onNewVertex = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onNewVertex');
      }
    };
    handler.onVertexMarkerClick = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerClick');
      }
    };
    handler.onVertexRawMarkerClick = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexRawMarkerClick');
      }
    };
    handler.onVertexDeleted = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexDeleted');
      }
    };
    handler.onVertexMarkerCtrlClick = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerCtrlClick');
      }
    };
    handler.onVertexMarkerShiftClick = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerShiftClick');
      }
    };
    handler.onVertexMarkerMetaKeyClick = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerMetaKeyClick');
      }
    };
    handler.onVertexMarkerAltClick = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerAltClick');
      }
    };
    handler.onVertexMarkerContextMenu = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerContextMenu');
      }
    };
    handler.onVertexMarkerMouseDown = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerMouseDown');
      }
    };
    handler.onVertexMarkerMouseOver = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerMouseOver');
      }
    };
    handler.onVertexMarkerMouseOut = (e, m) => {
      if (EDITABLE_EVENT_DEBUG) {
        console.log('onVertexMarkerMouseOut');
      }
      handler.onMiddleMarkerMouseDown = (e, m) => {
        if (EDITABLE_EVENT_DEBUG) {
          console.log('onMiddleMarkerMouseDown');
        }
      };
    };
    setLeafletEditableHandlers(handler);
    const q = new PQueue({ concurrency: 1 });
    setEditQueue(q);
  }, []);

  //save geo
  React.useEffect(() => {
    if (currentGeoEdit && currentGeoEdit.geometry !== null) {
      console.log('hook in context to save: ', currentGeoEdit.geometry);
      currentGeoEdit.onSave({ ...currentGeoEdit.geometry });
    }
  }, [currentGeoEdit]);

  const debug = false;
  React.useEffect(() => {
    if (debug) {
      let debugObj = {};
      debugObj['mode'] = mode;
      debugObj['editref'] = editRef;
      debugObj['geoEdited'] = currentGeoEdit;
      console.log('map records context:');
      console.dir(debugObj);
    }
  }, [mode, currentGeoEdit, editRef]);

  return (
    <>
      {
        //don't render the map without (at least) placeholder handlers set or react-leaflet-editable crashes
        leafletEditableHandlers ? (
          <MapRecordsContext.Provider
            value={{
              currentGeoEdit,
              setCurrentGeoEdit,
              editRef,
              setEditRef,
              editQueue,
              leafletEditableHandlers,
              setLeafletEditableHandlers
            }}>
            {props.children}
          </MapRecordsContext.Provider>
        ) : (
          <></>
        )
      }
    </>
  );
};
