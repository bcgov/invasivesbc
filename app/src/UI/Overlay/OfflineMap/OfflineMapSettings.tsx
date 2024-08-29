import { useSelector } from 'utils/use_selector';
import { OverlayHeader } from '../OverlayHeader';
import area from '@turf/area';
import './OfflineMapSettings.css';
import { Button, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import {
  OFFLINE_MAP_CACHING_DELETE,
  OFFLINE_MAP_CACHING_DELETE_ALL,
  OFFLINE_MAP_CACHING_DOWNLOAD,
  OFFLINE_MAP_CACHING_CREATE_SHAPE
} from 'state/actions';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { promptConfirmationInput } from 'utils/userPrompts';

const OfflineMapSettings = () => {
  const [customLayerName, setCustomLayerName] = useState<string>('');
  const [customInputValid, setCustomInputValid] = useState<boolean>(false);
  const [tempMapShape, setTempMapShape] = useState<number[][]>([]);

  const { clientBoundaries, cachedMapLayers } = useSelector((state) => state.Map);
  const dispatch = useDispatch();

  useEffect(() => {
    /**
     * - Check Shape is created
     * - Check Shape is named + valid
     */
    setCustomInputValid(customLayerName.length > 3);
  }, [customLayerName]);

  /**
   * Fire Event that Toggles off Map layer, and lets user draw shape on map
   */
  const handleCreateCustomMapShape = () => {
    dispatch({ type: OFFLINE_MAP_CACHING_CREATE_SHAPE });
  };
  /**
   * Take Local Variables to fire download Event
   */
  const handleDownloadCustomLayer = () => {
    const newCacheEntry = { id: Math.random(), title: customLayerName, geojson: { geometry: {} } };
    dispatch({
      type: OFFLINE_MAP_CACHING_DOWNLOAD,
      payload: newCacheEntry
    });
  };
  /**
   * @desc Estimate the file size for a given shape download at zoom layer 18, calculations include the image layer and data layer
   * @external {@link https://docs.mapbox.com/help/glossary/zoom-level/} sqMeterPerTile values at Latitude (+-)60
   * @param sqMeters Calculated area to be cached in square meters
   * @returns
   */
  const estimateDownloadSize = (sqMeters: number): number => {
    const px = 256 * 256;
    const meterPerPixelLayerEighteen = 0.229;
    const sqMeterPerTile = px * meterPerPixelLayerEighteen;
    const estSizeOfImageTileInKb = 9;
    const estSizeOfDataTileInKb = 5;
    const estimatedImageSizeInMb = (Math.ceil(sqMeters / sqMeterPerTile) * estSizeOfImageTileInKb) / 1000;
    const estimatedDataSizeInMb = (Math.ceil(sqMeters / sqMeterPerTile) * estSizeOfDataTileInKb) / 1000;
    return Math.ceil(estimatedImageSizeInMb + estimatedDataSizeInMb);
  };
  const handleDeleteAll = () => {
    const callback = (input: boolean): void => {
      if (input) {
        dispatch({ type: OFFLINE_MAP_CACHING_DELETE_ALL });
      }
    };
    dispatch(
      promptConfirmationInput({
        title: 'Delete All Cached Maptiles',
        prompt: [
          'This action will delete all custom layered map tiles stored on your device',
          'This will not remove the base layer that comes pre-built into the application',
          'Are you sure you wish to proceed?'
        ],
        confirmText: 'Delete all tiles',
        callback
      })
    );
  };

  /** @desc Handler for downloading one set of map tiles from a layer */
  const handleDownloadOne = (id: string) => {
    const eventEntry = clientBoundaries.find((item) => item.id === id);
    if (!cachedMapLayers.includes(eventEntry)) {
      dispatch({
        type: OFFLINE_MAP_CACHING_DOWNLOAD,
        payload: { ...eventEntry }
      });
    }
  };
  /** @desc Handler for deleting one set of map tiles from cache */
  const handleDeleteOne = (id: string) => {
    const eventEntry = clientBoundaries.find((item) => item.id === id);
    dispatch({
      type: OFFLINE_MAP_CACHING_DELETE,
      payload: { ...eventEntry }
    });
  };
  const sharedCols: GridColDef[] = [
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
      renderCell: (params) => <div>{estimateDownloadSize(area(params.row.geojson.geometry)).toLocaleString()}mb</div>,
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
        onClick={handleDownloadOne.bind(this, params.value)}
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
      <Button onClick={handleDeleteOne.bind(this, params.value)} variant="contained" color="error">
        Delete Tiles
      </Button>
    ),
    sortable: false
  };

  return (
    <div id="offlineMapContainer">
      <OverlayHeader />
      <h2>Offline Maps</h2>
      <p>Manage your map data for offline access</p>
      <section role="currentCache" aria-label="Currently cached maps">
        <h3>Currently Cached Maps</h3>
        <p>Manage your cached map tilesets. View details or delete individual tilesets.</p>
        {cachedMapLayers.length > 0 ? (
          <DataGrid
            columns={[...sharedCols, deleteCol]}
            rows={cachedMapLayers}
            sx={{ width: '600pt', minHeight: 370 }}
            disableColumnFilter
            disableColumnMenu
            disableRowSelectionOnClick
          />
        ) : (
          <div className="customBox">
            <p>There are no map tilesets stored on your device.</p>
          </div>
        )}
      </section>
      <section role="customLayer" aria-label="Create custom layer">
        <h3>Create Custom Layer</h3>
        <p>Design your own custom layer for offline map tiles. Draw a shape and customize its settings.</p>

        <div className="customBox">
          <div className="innerCustom">
            <TextField
              size="small"
              value={customLayerName}
              label={'Name of new layer'}
              onChange={(evt) => {
                setCustomLayerName(evt.target.value);
              }}
            />
            <Button variant="outlined" color="primary" onClick={handleCreateCustomMapShape}>
              Draw Shape
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadCustomLayer}
              disabled={!customInputValid || tempMapShape.length === 0}
            >
              Download Tiles
            </Button>
          </div>
        </div>
      </section>
      <section role="existingMapLayers" aria-label="User layers">
        <h3>Existing Custom Map Layers</h3>
        <p>Select a layer you've previously created to download its tileset for offline use.</p>
        {clientBoundaries.length > 0 ? (
          <DataGrid
            columns={[...sharedCols, downloadCol]}
            rows={clientBoundaries}
            sx={{ width: '600pt', minHeight: 370 }}
            disableColumnFilter
            disableColumnMenu
            disableRowSelectionOnClick
          />
        ) : (
          <div className="customBox">
            <p>You have no defined any custom boundaries on the map.</p>
          </div>
        )}
      </section>
      <div>
        <h3>Delete all Tiles</h3>
        <p>You can delete all cached tiles from your device here</p>
        <Button variant="contained" color="error" onClick={handleDeleteAll}>
          Clear all Cached Tiles
        </Button>
      </div>
    </div>
  );
};

export default OfflineMapSettings;
