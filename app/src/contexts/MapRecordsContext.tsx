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
    if (!leafletEditableHandlers) {
      let handler: any = {};
      // some placeholder handlers for when people are chasing their tail
      handler.onShapeDelete = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onShapeDeleted = (e, m) => {
        console.log('onShapeDeleted');
      };
      handler.onEditing = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onEnable = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDisable = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onStartDrawing = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDrawingClick = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onEndDrawing = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDrawingCommit = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDrawingMouseDown = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDrawingMouseUp = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDrawingMove = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onCancelDrawing = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDragStart = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDrag = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onDragEnd = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerDrag = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerDragStart = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerDragEnd = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertextCtrlClick = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onNewVertex = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerClick = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexRawMarkerClick = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexDeleted = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerCtrlClick = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerShiftClick = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerMetaKeyClick = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerAltClick = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerContextMenu = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerMouseDown = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerMouseOver = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onVertexMarkerMouseOut = (e, m) => {
        console.log('onShapeDelete');
      };
      handler.onMiddleMarkerMouseDown = (e, m) => {
        console.log('onShapeDelete');
      };
    }
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
  );
};
