import { useSelector } from 'utils/use_selector';
import { OverlayHeader } from '../OverlayHeader';
import area from '@turf/area';
import './OfflineMapSettings.css';
import { useState } from 'react';
import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { NEW_ALERT } from 'state/actions';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const OfflineMapSettings = () => {
  const drawnLayers = useSelector((state) => state.Map?.clientBoundaries);
  const [downloadLayers, setDownloadLayers] = useState<Record<string, any>[]>([]);
  const dispatch = useDispatch();

  const handleClick = (id) => {
    const eventItem = drawnLayers.find((item) => item.id === id);
    if (!downloadLayers.includes(eventItem)) {
      setDownloadLayers((oldVal) => [...oldVal, eventItem]);
      dispatch({
        type: NEW_ALERT,
        payload: {
          content: 'Map Downloading...',
          subject: AlertSubjects.Map,
          severity: AlertSeverity.Info,
          autoClose: 5
        }
      });
    }
  };
  const handleDelete = (id) => {
    setDownloadLayers((oldVal) => oldVal.filter((item) => item.id !== id));
    dispatch({
      type: NEW_ALERT,
      payload: {
        content: 'Map Successfully Deleted',
        subject: AlertSubjects.Map,
        severity: AlertSeverity.Info,
        autoClose: 5
      }
    });
  };
  const gridColumns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Layer Name',
      flex: 0.1,
      sortable: false
    },
    {
      field: 'area',
      headerName: 'Area of Layer',
      flex: 0.1,
      renderCell: (params) => (
        <div>
          {Math.floor(area(params.row.geojson.geometry)).toLocaleString()}
          {'m\u00b2'}
        </div>
      ),
      sortable: false
    },
    {
      field: 'estFileSize',
      headerName: 'Est. File Size',
      flex: 0.1,
      renderCell: (params) => (
        <div>{Math.floor(((area(params.row.geojson.geometry) / (50 ^ 2)) * 45) / 150000).toLocaleString()}mb</div>
      ),
      sortable: false
    }
  ];
  const downloadCol: GridColDef = {
    field: 'id',
    headerName: '',
    flex: 0.1,
    renderCell: (params) => (
      <Button variant="contained" color="primary" onClick={handleClick.bind(this, params.value)}>
        Download Tiles
      </Button>
    ),
    sortable: false
  };

  const deleteCol: GridColDef = {
    field: 'id',
    headerName: '',
    flex: 0.1,
    renderCell: (params) => (
      <Button onClick={handleDelete.bind(this, params.value)} variant="contained" color="error">
        Delete Tiles
      </Button>
    ),
    sortable: false
  };
  return (
    <>
      <OverlayHeader />
      <div id="offlineMapContainer">
        <h2>User Layers</h2>
        <DataGrid
          columns={[...gridColumns, downloadCol]}
          rows={drawnLayers}
          sx={{ minWidth: '600pt', minHeight: 370 }}
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
        />
        <h2>Currently Cached Maps</h2>
        <DataGrid
          columns={[...gridColumns, deleteCol]}
          rows={downloadLayers}
          sx={{ minWidth: '600pt', minHeight: 370 }}
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
        />
      </div>
    </>
  );
};

export default OfflineMapSettings;
