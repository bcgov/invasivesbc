import PQueue from 'p-queue/dist';
import * as React from 'react';

// A place for the app to track what records are passed to map & which are selected
// or being edited.  To be used for spatial select, filtering and editing

// keep scrolling for comments on what each is for
interface IMapRecords {
  records?: any[];
  setRecords?: React.Dispatch<React.SetStateAction<[]>>;
  selectedRecords?: Object;
  setSelectedRecords?: React.Dispatch<React.SetStateAction<[]>>;
  currentGeoEdit?: any;
  setCurrentGeoEdit?: React.Dispatch<React.SetStateAction<any>>;
  onEachFeature?: any;
  setOnEachFeature?: React.Dispatch<React.SetStateAction<any>>;
  editRef?: any;
  setEditRef?: React.Dispatch<React.SetStateAction<any>>;
  mode?: any;
  setMode?: React.Dispatch<React.SetStateAction<any>>;
  editQueue?: any;
  setLeafletEditableHandlers?: React.Dispatch<React.SetStateAction<any>>;
  leafletEditableHandlers?: any;
}

export const MapRecordsContext = React.createContext<IMapRecords>({
  // all the geometries to display
  records: [],
  setRecords: () => {},

  // style callback
  onEachFeature: () => {},
  setOnEachFeature: () => {},

  // records to indicate as selected, should be a subset of records above
  selectedRecords: [],
  setSelectedRecords: () => {},

  // place to track current geo being edited
  // independant of records and selectedRecords (depending on how controlling comp works)
  currentGeoEdit: null,
  setCurrentGeoEdit: () => {},

  // all to support react-leaflet editable
  editRef: null,
  setEditRef: () => {},
  mode: null,
  setMode: () => {},
  editQueue: null,
  setLeafletEditableHandlers: () => {},
  leafletEditableHandlers: null
});

export enum modes {
  default = 'default',
  dropNewRecord = 'drop new record'
}

export const MapRecordsContextProvider: React.FC = (props) => {
  const [mode, setMode] = React.useState(null);
  const [records, setRecords] = React.useState<any[]>([]);
  const [selectedRecords, setSelectedRecords] = React.useState([]);
  const [currentGeoEdit, setCurrentGeoEdit] = React.useState(null);
  const [onEachFeature, setOnEachFeature] = React.useState(null);
  const [editRef, setEditRef] = React.useState(null);
  const [editQueue, setEditQueue] = React.useState(null);
  const [leafletEditableHandlers, setLeafletEditableHandlers] = React.useState(null);

  React.useEffect(() => {
    let handler: any = {};
    if (!leafletEditableHandlers) {
      // some placeholder handlers for when people are chasing their tail
      handler.onShapeDelete = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onShapeDeleted = (e, m) => {
        console.log('onShapeDeleted');
      };
      handler.onEditing = (e, m) => {
        console.log('onEditing');
      };
      handler.onEnable = (e, m) => {
        console.log('onEnable');
      };
      handler.onDisable = (e, m) => {
        console.log('onDisable');
      };
      handler.onStartDrawing = (e, m) => {
        console.log('onStartDrawing');
      };
      handler.onDrawingClick = (e, m) => {
        console.log('onDrawingClick');
      };
      handler.onEndDrawing = (e, m) => {
        console.log('onEndDrawing');
      };
      handler.onDrawingCommit = (e, m) => {
        console.log('onDrawingCommit');
      };
      handler.onDrawingMouseDown = (e, m) => {
        console.log('onDrawingMouseDown');
      };
      handler.onDrawingMouseUp = (e, m) => {
        console.log('onDrawingMouseUp');
      };
      handler.onDrawingMove = (e, m) => {
        console.log('onDrawingMove');
      };
      handler.onCancelDrawing = (e, m) => {
        console.log('onCancelDrawing');
      };
      handler.onDragStart = (e, m) => {
        console.log('onDragStart');
      };
      handler.onDrag = (e, m) => {
        console.log('onDrag');
      };
      handler.onDragEnd = (e, m) => {
        console.log('onDragEnd');
      };
      handler.onVertexMarkerDrag = (e, m) => {
        console.log('onVertexMarkerDrag');
      };
      handler.onVertexMarkerDragStart = (e, m) => {
        console.log('onVertexMarkerDragStart');
      };
      handler.onVertexMarkerDragEnd = (e, m) => {
        console.log('onVertexMarkerDragEnd');
      };
      handler.onVertextCtrlClick = (e, m) => {
        console.log('onVertextCtrlClick');
      };
      handler.onNewVertex = (e, m) => {
        console.log('onNewVertex');
      };
      handler.onVertexMarkerClick = (e, m) => {
        console.log('onVertexMarkerClick');
      };
      handler.onVertexRawMarkerClick = (e, m) => {
        console.log('onVertexRawMarkerClick');
      };
      handler.onVertexDeleted = (e, m) => {
        console.log('onVertexDeleted');
      };
      handler.onVertexMarkerCtrlClick = (e, m) => {
        console.log('onVertexMarkerCtrlClick');
      };
      handler.onVertexMarkerShiftClick = (e, m) => {
        console.log('onVertexMarkerShiftClick');
      };
      handler.onVertexMarkerMetaKeyClick = (e, m) => {
        console.log('onVertexMarkerMetaKeyClick');
      };
      handler.onVertexMarkerAltClick = (e, m) => {
        console.log('onVertexMarkerAltClick');
      };
      handler.onVertexMarkerContextMenu = (e, m) => {
        console.log('onVertexMarkerContextMenu');
      };
      handler.onVertexMarkerMouseDown = (e, m) => {
        console.log('onVertexMarkerMouseDown');
      };
      handler.onVertexMarkerMouseOver = (e, m) => {
        console.log('onVertexMarkerMouseOver');
      };
      handler.onVertexMarkerMouseOut = (e, m) => {
        console.log('onVertexMarkerMouseOut');
      };
      handler.onMiddleMarkerMouseDown = (e, m) => {
        console.log('onMiddleMarkerMouseDown');
      };
    }
    setLeafletEditableHandlers(handler);
    const q = new PQueue({ concurrency: 1 });
    setEditQueue(q);
  }, []);

  const debug = true;
  React.useEffect(() => {
    if (debug) {
      let debugObj = {};
      debugObj['mode'] = mode;
      debugObj['records'] = records;
      debugObj['selectedRecords'] = selectedRecords;
      debugObj['editref'] = editRef;
      console.log('map records context:');
      console.dir(debugObj);
    }
  }, [mode, records, selectedRecords, currentGeoEdit, onEachFeature, editRef]);

  return (
    <>
      {
        //don't render the map without (at least) placeholder handlers set or react-leaflet-editable crashes
        leafletEditableHandlers ? (
          <MapRecordsContext.Provider
            value={{
              records,
              setRecords,
              selectedRecords,
              setSelectedRecords,
              currentGeoEdit,
              setCurrentGeoEdit,
              onEachFeature,
              setOnEachFeature,
              editRef,
              setEditRef,
              mode,
              setMode,
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
