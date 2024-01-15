import React, { useEffect, useMemo } from 'react';

import Close from '@mui/icons-material/Close';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Delete from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';
import LabelClearIcon from '@mui/icons-material/LabelOff';
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { Button, Tooltip, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Route, useHistory } from 'react-router';
import {
  USER_SETTINGS_ADD_RECORD_SET,
  USER_SETTINGS_ADD_RECORD_SET_REQUEST,
  USER_SETTINGS_REMOVE_RECORD_SET,
  USER_SETTINGS_SET_RECORDSET
} from 'state/actions';
import { Activity } from './Record';
import './Records.css';
import { OverlayHeader } from '../OverlayHeader';
import { TouchHoldHandler } from '../TouchHoldHandler/TouchHoldHandler';
import Spinner from 'UI/Spinner/Spinner';

export const Records = (props) => {
  // this version of layer 'highlighting' uses a usestate variable, but should be turned into a redux state variable
  // before getting the map layers to interact with the list item on hover.
  const recordSets = useSelector((state: any) => state.UserSettings?.recordSets);

  const loaded = useSelector((state: any) =>
    state.Map?.layers?.map((layer) => {
      return { recordSetID: layer?.recordSetID, loading: layer?.loading, type: layer?.type };
    })
  );
  const isActivitiesGeoJSONLoaded = useSelector((state: any) => state.Map?.activitiesGeoJSONDict !== undefined);
  const isIAPPGeoJSONLoaded = useSelector((state: any) => state.Map?.IAPPGeoJSONDict !== undefined);

  const [loadMap, setLoadMap] = React.useState({});

  useEffect(() => {
    let rv = {};
    loaded.forEach((layer) => {
      const geojson = layer?.type === 'Activity' ? isActivitiesGeoJSONLoaded : isIAPPGeoJSONLoaded;
      rv[layer?.recordSetID] = !layer?.loading && geojson;
    });
    setLoadMap(rv);
  }, [JSON.stringify(loaded), isActivitiesGeoJSONLoaded, isIAPPGeoJSONLoaded]);

  const colours = ['#2A81CB', '#FFD326', '#CB2B3E', '#2AAD27', '#CB8427', '#CAC428', '#9C2BCB', '#7B7B7B', '#3D3D3D'];

  const history = useHistory();
  const dispatch = useDispatch();

  const onClickCreateRecordSet = (isPOI: boolean, e) => {
    dispatch({
      type: USER_SETTINGS_ADD_RECORD_SET_REQUEST,
      payload: {
        recordSetType: isPOI ? 'IAPP' : 'Activity'
      }
    });
  };

  //Record set on click handlers:
  const onClickToggleLabel = (set: any, e) => {
    console.dir(e);
    e.stopPropagation();
    dispatch({
      type: USER_SETTINGS_SET_RECORDSET,
      payload: {
        updatedSet: {
          labelToggle: !recordSets?.[set]?.labelToggle
        },
        setName: set
      }
    });
  };

  const onClickToggleLayer = (set: any, e) => {
    console.log('clicked');
    e.stopPropagation();
    dispatch({
      type: USER_SETTINGS_SET_RECORDSET,
      payload: {
        updatedSet: {
          mapToggle: !recordSets?.[set]?.mapToggle
        },
        setName: set
      }
    });
  };

  const onClickCycleColour = (set: any, e) => {
    e.stopPropagation();
    const currentIndex = colours.indexOf(recordSets?.[set]?.color);
    const nextIndex = (currentIndex + 1) % colours.length;

    dispatch({
      type: USER_SETTINGS_SET_RECORDSET,
      payload: {
        updatedSet: {
          color: colours[nextIndex]
        },
        setName: set
      }
    });
  };

  const onClickDeleteRecordSet = (set: any, e) => {
    e.stopPropagation();
    if (
      /*eslint-disable*/
      confirm(
        'Are you sure you want to remove this record set?  The data will persist but you will no longer have this set of filters or the map layer.'
      )
    ) {
      dispatch({
        type: USER_SETTINGS_REMOVE_RECORD_SET,
        payload: {
          setID: set
        }
      });
    }
  };

  const [highlightedSet, setHighlightedSet] = React.useState(null);

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
                    title="Add a new list of records, and layer on map.  If toggled on, any records matching the filters for this recordset will also show up with the What's Here tool.">
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
                    }}>
                    <div key={set + 'spinner'}>{!loadMap?.[set] ? <Spinner /> : <></>}</div>
                    <div className="records_set_left_hand_items">
                      <div className="records_set_name">
                        <Typography>{recordSets?.[set]?.recordSetName}</Typography>
                      </div>
                    </div>

                    <div className="records_set_right_hand_items">
                      <Tooltip
                        classes={{ tooltip: 'toolTip' }}
                        title="Toggle viewing the labels on the map for this layer.  If more than 200 are in the extent, you may need to zoom in to see what you are looking for.  For people on slow computers - it recalculates on drag and zoom so fewer small drags will decrease loading time.">
                        <Button
                          className="records__set__layer_toggle"
                          onClick={(e) => onClickToggleLabel(set, e)}
                          variant="outlined">
                          {recordSets?.[set]?.labelToggle ? <LabelIcon /> : <LabelClearIcon />}
                        </Button>
                      </Tooltip>

                      <Tooltip
                        classes={{ tooltip: 'toolTip' }}
                        title="Toggle viewing the layer on the map, and including these records in the Whats Here search results.">
                        <Button
                          className="records__set__layer_toggle"
                          onClick={(e) => onClickToggleLayer(set, e)}
                          variant="outlined">
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
                              variant="contained">
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
                          title="Delete this layer/list of records.  Does NOT delete the actual records, just the set of filters / layer configuration.">
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
                onClick={() => dispatch({ type: USER_SETTINGS_ADD_RECORD_SET, payload: { recordSetType: 'Activity' } })}
                className={'addRecordSet'}>
                Add Layer of Records
              </Button>
              <Button
                onClick={() => dispatch({ type: USER_SETTINGS_ADD_RECORD_SET, payload: { recordSetType: 'IAPP' } })}
                className={'addRecordSet'}>
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
