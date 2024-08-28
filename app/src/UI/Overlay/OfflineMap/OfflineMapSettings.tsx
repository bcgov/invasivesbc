import { useSelector } from 'utils/use_selector';
import { OverlayHeader } from '../OverlayHeader';
import area from '@turf/area';
import './OfflineMapSettings.css';
import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { OFFLINE_MAP_CACHING_DELETE, OFFLINE_MAP_CACHING_DOWNLOAD } from 'state/actions';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const OfflineMapSettings = () => {
  const { clientBoundaries, cachedMapLayers } = useSelector((state) => state.Map);
  const dispatch = useDispatch();

  const validateCustomLayerDetails = () => {};
  const handleDownloadCustomLayer = () => {};

  const handleDownload = (id) => {
    const eventEntry = clientBoundaries.find((item) => item.id === id);
    if (!cachedMapLayers.includes(eventEntry)) {
      dispatch({
        type: OFFLINE_MAP_CACHING_DOWNLOAD,
        payload: { ...eventEntry }
      });
    }
  };
  const handleDelete = (id) => {
    const eventEntry = clientBoundaries.find((item) => item.id === id);
    dispatch({
      type: OFFLINE_MAP_CACHING_DELETE,
      payload: { ...eventEntry }
    });
  };
  const gridColumns: GridColDef[] = [
    {
      field: 'title',
      flex: 0.1,
      headerName: 'Layer Name',
      sortable: false
    },
    {
      field: 'area',
      flex: 0.1,
      headerName: 'Area of Layer',
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
      flex: 0.1,
      headerName: 'Est. File Size',
      renderCell: (params) => (
        <div>{Math.floor(((area(params.row.geojson.geometry) / (50 ^ 2)) * 45) / 150000).toLocaleString()}mb</div>
      ),
      sortable: false
    }
  ];
  const downloadCol: GridColDef = {
    field: 'id',
    flex: 0.1,
    headerName: '',
    renderCell: (params) => (
      <Button
        variant="contained"
        color="primary"
        disabled={cachedMapLayers.some((item) => item.id === params.value)}
        onClick={handleDownload.bind(this, params.value)}
      >
        Download Tiles
      </Button>
    ),
    sortable: false
  };

  const deleteCol: GridColDef = {
    field: 'id',
    flex: 0.1,
    headerName: '',
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
          rows={clientBoundaries}
          sx={{ minWidth: '600pt', minHeight: 370 }}
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
        />
        <h2>Currently Cached Maps</h2>
        <DataGrid
          columns={[...gridColumns, deleteCol]}
          rows={cachedMapLayers}
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
