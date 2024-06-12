import React, { useEffect, useState } from 'react';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Delete from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import LabelClearIcon from '@mui/icons-material/LabelOff';
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
import EjectIcon from '@mui/icons-material/Eject';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

import { Button, Tooltip, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Route } from 'react-router';
import {
  INIT_CACHE_RECORDSET,
  USER_SETTINGS_ADD_RECORD_SET,
  USER_SETTINGS_ADD_RECORD_SET_REQUEST,
  USER_SETTINGS_REMOVE_RECORD_SET,
  USER_SETTINGS_SET_RECORDSET
} from 'state/actions';
import './Records.css';
import { OverlayHeader } from '../OverlayHeader';
import Spinner from 'UI/Spinner/Spinner';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'utils/use_selector';

export const Records = () => {
  const MapMode = useSelector((state) => state.Map.MapMode);
  // this version of layer 'highlighting' uses a usestate variable, but should be turned into a redux state variable
  // before getting the map layers to interact with the list item on hover.
  const recordSets = useSelector((state) => state.UserSettings.recordSets);
  const CONFIGURATION_IS_MOBILE = useSelector((state) => state.Configuration.current.MOBILE);

  const mapLayers = useSelector((state) => state.Map.layers);

  const [isActivitiesGeoJSONLoaded, setActivitiesGeoJSONLoaded] = useState(false);

  const activitiesGeoJSONState = useSelector((state) => state.Map.activitiesGeoJSONDict);

  useEffect(() => {
    setActivitiesGeoJSONLoaded(Object.hasOwn(activitiesGeoJSONState, 's3'));
  }, [activitiesGeoJSONState]);

  const isIAPPGeoJSONLoaded = useSelector((state) => state.Map.IAPPGeoJSONDict !== null);

  const [loadMap, setLoadMap] = React.useState({});

  useEffect(() => {
    const rv = {};
    mapLayers.forEach((layer) => {
      const geojson = layer?.type === 'Activity' ? isActivitiesGeoJSONLoaded : isIAPPGeoJSONLoaded;
      if (MapMode !== 'VECTOR_ENDPOINT') {
        rv[layer?.recordSetID] = !layer?.loading && geojson;
      } else {
        rv[layer?.recordSetID] = !layer?.loading;
      }
    });
    setLoadMap(rv);
  }, [JSON.stringify(mapLayers), isActivitiesGeoJSONLoaded, isIAPPGeoJSONLoaded, MapMode]);

  const colours = ['#2A81CB', '#FFD326', '#CB2B3E', '#2AAD27', '#CB8427', '#CAC428', '#9C2BCB', '#7B7B7B', '#3D3D3D'];

  const history = useHistory();
  const dispatch = useDispatch();

  const onClickCreateRecordSet = (isPOI: boolean, e) => {
    dispatch(
      USER_SETTINGS_ADD_RECORD_SET_REQUEST({
        recordSetType: isPOI ? 'IAPP' : 'Activity'
      })
    );
  };

  //Record set on click handlers:
  const onClickToggleLabel = (set: any, e) => {
    console.dir(e);
    e.stopPropagation();
    dispatch(
      USER_SETTINGS_SET_RECORDSET({
        updatedSet: {
          labelToggle: !recordSets?.[set]?.labelToggle
        },
        setName: set
      })
    );
  };

  const onClickToggleLayer = (set: any, e) => {
    console.log('clicked');
    e.stopPropagation();
    dispatch(
      USER_SETTINGS_SET_RECORDSET({
        updatedSet: {
          mapToggle: !recordSets?.[set]?.mapToggle
        },
        setName: set
      })
    );
  };

  const onClickCycleColour = (set: any, e) => {
    e.stopPropagation();
    const currentIndex = colours.indexOf(recordSets?.[set]?.color);
    const nextIndex = (currentIndex + 1) % colours.length;

    dispatch(
      USER_SETTINGS_SET_RECORDSET({
        updatedSet: {
          color: colours[nextIndex]
        },
        setName: set
      })
    );
  };

  const onClickDeleteRecordSet = (set: any, e) => {
    e.stopPropagation();
    if (
      /*eslint-disable*/
      confirm(
        'Are you sure you want to remove this record set?  The data will persist but you will no longer have this set of filters or the map layer.'
      )
    ) {
      dispatch(
        USER_SETTINGS_REMOVE_RECORD_SET({
          setID: set
        })
      );
    }
  };

  const onClickInitCache = (set: any, e) => {
    e.stopPropagation();
    dispatch(
      INIT_CACHE_RECORDSET({
        setID: set
      })
    );

    setTimeout(() => {
      dispatch(
        USER_SETTINGS_SET_RECORDSET({
          updatedSet: {
            cached: true,
            cachedTime: new Date().toLocaleDateString(),
            offlineMode: true
          },
          setName: set
        })
      );
    }, 3000);
  };

  const onClickToggleViewCache = (set: any, e) => {
    e.stopPropagation();
    dispatch(
      USER_SETTINGS_SET_RECORDSET({
        updatedSet: {
          offlineMode: !recordSets?.[set]?.offlineMode
        },
        setName: set
      })
    );
  };

  const onClickInitClearCache = (set: any, e) => {
    e.stopPropagation();
    dispatch(
      USER_SETTINGS_SET_RECORDSET({
        updatedSet: {
          isDeletingCache: true
        },
        setName: set
      })
    );

    setTimeout(() => {
      dispatch(
        USER_SETTINGS_SET_RECORDSET({
          updatedSet: {
            cached: false,
            cachedTime: '',
            offlineMode: false,
            isDeletingCache: false,
            isCaching: false
          },
          setName: set
        })
      );
    }, 3000);
  };

  const [highlightedSet, setHighlightedSet] = React.useState(null);
  const [isEditingName, setIsEditingName] = React.useState(false);

  return (
    <div className="records__container">
      <Route
        path="/Records"
        exact={true}
        render={(props) =>
          recordSets ? (
            <>
              <OverlayHeader>
                <div className="record_sets_header_new_set_button">
                  <Tooltip
                    classes={{ tooltip: 'toolTip' }}
                    title="Add a new list of records, and layer on map.  If toggled on, any records matching the filters for this recordset will also show up with the What's Here tool."
                  >
                    <Button variant="contained" onClick={(e) => onClickCreateRecordSet(false, e)}>
                      + Add List / Layer
                    </Button>
                  </Tooltip>
                </div>
              </OverlayHeader>
              {Object.keys(recordSets)?.map((set) => {
                return (
                  <div
                    key={set}
                    onClick={() => {
                      history.push('/Records/List/Local:' + set);
                    }}
                    onMouseOver={() => {
                      setHighlightedSet(set);
                    }}
                    onMouseOut={() => {
                      setHighlightedSet(null);
                    }}
                    className={'records_set'}
                    style={{
                      borderColor:
                        typeof highlightedSet === 'string' && highlightedSet === set
                          ? recordSets?.[set]?.color
                          : 'black',
                      borderStyle: 'solid',
                      borderWidth: typeof highlightedSet === 'string' && highlightedSet === set ? '5px' : '1px'
                    }}
                  >
                    <div key={set + 'spinner'}>{!loadMap?.[set] ? <Spinner /> : <></>}</div>
                    <div className="records_set_left_hand_items">
                      <>
                        {isEditingName && !['1', '2', '3'].includes(set) ? (
                          <>
                            <input
                              onChange={(e) =>
                                dispatch({
                                  type: USER_SETTINGS_SET_RECORDSET,
                                  payload: { updatedSet: { recordSetName: e.target.value }, setName: set }
                                })
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              type="text"
                              value={recordSets?.[set]?.recordSetName}
                            />
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingName(false);
                              }}
                            >
                              <CheckIcon />
                            </Button>
                          </>
                        ) : ['1', '2', '3'].includes(set) ? (
                          <></>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingName(true);
                            }}
                          >
                            <EditIcon />
                          </Button>
                        )}
                      </>
                      <div className="records_set_name">
                        {isEditingName && !['1', '2', '3'].includes(set) ? <></> : <Typography>{recordSets?.[set]?.recordSetName}</Typography>}
                      </div>
                    </div>

                    <div className="records_set_right_hand_items">
                      {CONFIGURATION_IS_MOBILE && recordSets?.[set]?.cached ? (
                        <Tooltip
                          classes={{ tooltip: 'toolTip' }}
                          title="Click to clear cached data for this layer of records"
                        >
                          <Button
                            className="records__set__layer_cache"
                            onClick={(e) => onClickInitClearCache(set, e)}
                            variant="outlined"
                          >
                            {!recordSets?.[set]?.isDeletingCache ? <EjectIcon /> : 'Deleting Cache'}
                          </Button>
                        </Tooltip>
                      ) : (
                        <></>
                      )}

                      {CONFIGURATION_IS_MOBILE && recordSets?.[set]?.cached ? (
                        <Tooltip
                          classes={{ tooltip: 'toolTip' }}
                          title="Click to toggle viewing cached data or online if available"
                        >
                          <Button
                            className="records__set__layer_cache"
                            onClick={(e) => onClickToggleViewCache(set, e)}
                            variant="outlined"
                          >
                            {recordSets?.[set]?.offlineMode ? <WifiOffIcon /> : <WifiIcon />}
                          </Button>
                        </Tooltip>
                      ) : (
                        <></>
                      )}
                      {CONFIGURATION_IS_MOBILE ? (
                        <Tooltip classes={{ tooltip: 'toolTip' }} title="Click to save this layer and it's records">
                          <Button
                            className="records__set__layer_cache"
                            onClick={(e) => onClickInitCache(set, e)}
                            variant="outlined"
                          >
                            {recordSets?.[set]?.cached ? (
                              <>
                                <FileDownloadDoneIcon /> {recordSets?.[set]?.cachedTime}
                              </>
                            ) : recordSets?.[set]?.isCaching ? (
                              'saving'
                            ) : (
                              <>
                                <SaveIcon />
                                <WifiOffIcon />
                              </>
                            )}
                          </Button>
                        </Tooltip>
                      ) : (
                        <></>
                      )}
                      <Tooltip
                        classes={{ tooltip: 'toolTip' }}
                        title="Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time."
                      >
                        <Button
                          className="records__set__layer_toggle"
                          onClick={(e) => onClickToggleLabel(set, e)}
                          variant="outlined"
                        >
                          {recordSets?.[set]?.labelToggle ? <LabelIcon /> : <LabelClearIcon />}
                        </Button>
                      </Tooltip>

                      <Tooltip
                        classes={{ tooltip: 'toolTip' }}
                        title="Toggle viewing the layer on the map, and including these records in the Whats Here search results."
                      >
                        <Button
                          className="records__set__layer_toggle"
                          onClick={(e) => onClickToggleLayer(set, e)}
                          variant="outlined"
                        >
                          {recordSets?.[set]?.mapToggle ? <LayersIcon /> : <LayersClearIcon />}
                        </Button>
                      </Tooltip>

                      {recordSets?.[set]?.recordSetName === 'All InvasivesBC Activities' ||
                      recordSets?.[set]?.recordSetName === 'All IAPP Records' ||
                      recordSets?.[set]?.recordSetName === 'My Drafts' ? (
                        <></>
                      ) : (
                        <div className="records_set_layer_colour">
                          <Tooltip classes={{ tooltip: 'toolTip' }} title="Change the colour of this layer.">
                            <Button
                              onClick={(e) => onClickCycleColour(set, e)}
                              style={{ backgroundColor: recordSets?.[set]?.color }}
                              variant="contained"
                            >
                              <ColorLensIcon />
                            </Button>
                          </Tooltip>
                        </div>
                      )}

                      {recordSets?.[set]?.recordSetName === 'All InvasivesBC Activities' ||
                      recordSets?.[set]?.recordSetName === 'All IAPP Records' ||
                      recordSets?.[set]?.recordSetName === 'My Drafts' ? (
                        <></>
                      ) : (
                        <Tooltip
                          classes={{ tooltip: 'toolTip' }}
                          title="Delete this layer/list of records.  Does NOT delete the actual records, just the set of filters / layer configuration."
                        >
                          <Button onClick={(e) => onClickDeleteRecordSet(set, e)} variant="outlined">
                            <Delete />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
              <Button
                onClick={() => dispatch(USER_SETTINGS_ADD_RECORD_SET({ recordSetType: 'Activity' }))}
                className={'addRecordSet'}
              >
                Add Layer of Records
              </Button>
              <Button
                onClick={() => dispatch(USER_SETTINGS_ADD_RECORD_SET({ recordSetType: 'IAPP' }))}
                className={'addRecordSet'}
              >
                Add IAPP Layer of Records
              </Button>
            </>
          ) : (
            <></>
          )
        }
      />
    </div>
  );
};
