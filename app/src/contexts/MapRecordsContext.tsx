import * as React from 'react';

// A place for the app to track what records are passed to map & which are selected
// or being edited.  To be used for spatial select, filtering and editing

interface IMapRecords {
  records: any[];
  setRecords: React.Dispatch<React.SetStateAction<[]>>;
  selectedRecords: Object;
  setSelectedRecords: React.Dispatch<React.SetStateAction<[]>>;
  currentGeoEdit: any;
  setCurrentGeoEdit: React.Dispatch<React.SetStateAction<any>>;
  onEachFeature?: any;
  setOnEachFeature?: React.Dispatch<React.SetStateAction<any>>;
}

export const MapRecords = React.createContext<IMapRecords>({
  records: [],
  setRecords: () => {},
  onEachFeature: () => {},
  setOnEachFeature: () => {},
  selectedRecords: [],
  setSelectedRecords: () => {},
  currentGeoEdit: null,
  setCurrentGeoEdit: () => {}
});

export const MapRecordsProvider: React.FC = (props) => {
  const [records, setRecords] = React.useState<any[]>([]);
  const [selectedRecords, setSelectedRecords] = React.useState([]);
  const [currentGeoEdit, setCurrentGeoEdit] = React.useState(null);
  const [onEachFeature, setOnEachFeature] = React.useState(null);
  return (
    <MapRecords.Provider
      value={{
        records,
        setRecords,
        selectedRecords,
        setSelectedRecords,
        currentGeoEdit,
        setCurrentGeoEdit,
        onEachFeature,
        setOnEachFeature
      }}>
      {props.children}
    </MapRecords.Provider>
  );
};
