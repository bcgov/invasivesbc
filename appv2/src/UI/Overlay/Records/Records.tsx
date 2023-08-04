import React from 'react';

import './Records.css';
import { Route, useHistory } from 'react-router';
import { Activity } from './Record';
import { useDispatch, useSelector } from 'react-redux';
import { selectActivity } from 'state/reducers/activity';
import { selectIappsite } from 'state/reducers/iappsite';
import { selectUserSettings } from 'state/reducers/userSettings';
import { Button, Checkbox, Typography } from '@mui/material';
import IconButton from 'rjsf/components/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import LabelClearIcon from '@mui/icons-material/LabelOff';
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Delete from '@mui/icons-material/Delete';
import Close from '@mui/icons-material/Close';
import { USER_SETTINGS_REMOVE_RECORD_SET_REQUEST, USER_SETTINGS_SET_RECORD_SET_REQUEST } from 'state/actions';

export const Records = (props) => {
  const colours = ['#2A81CB', '#FFD326', '#CB2B3E', '#2AAD27', '#CB8427', '#CAC428', '#9C2BCB', '#7B7B7B', '#3D3D3D'];
  const userSettingsState = useSelector(selectUserSettings);

  const history = useHistory();
  const dispatch = useDispatch();
  const activityState = useSelector(selectActivity);
  const IAPPState = useSelector(selectIappsite);
  const navToRecord = (id: string, isIAPP?: boolean) => {
    if (isIAPP) {
      return () => history.push('/Records/IAPP:' + id);
    }
    return () => history.push('/Records/Activity:' + id);
  };

  const navToSet = (id: string, isIAPP?: boolean) => {
    if (isIAPP) {
      return () => history.push('/Records/Sets/Local:' + id);
    }
    return () => history.push('/Records/Sets/Local:' + id);
  };

  return (
    <div className="records__container">
      <Route path="/Records/Activity:id" component={Activity} />
      <Route
        path="/Records"
        exact={true}
        render={(props) =>
          userSettingsState?.recordSets ? (
            <>
              <div className="record_sets_header">
                <div className="record_sets_header_new_set_button">
                  <Button variant="contained" onClick={() => {}}>
                    + Add List / Layer
                  </Button>
                </div>

                <div className="record_sets_header_close_button">
                  <Button variant="contained" onClick={() => {}}>
                    <Close />
                  </Button>
                </div>
              </div>
              {Object.keys(userSettingsState?.recordSets)?.map((set) => {
                return (
                  <div
                    key={set}
                    onClick={() => {
                      //history.push('/Records/Sets/Local:' + set);
                    }}
                    className={'records_set'}>
                    <div className="records_set_left_hand_items">
                      <div className="records_set_name">
                        <Typography>{userSettingsState?.recordSets?.[set]?.recordSetName}</Typography>
                      </div>
                    </div>

                    <div className="records_set_right_hand_items">
                      <Button
                        className="records__set__layer_toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({
                            type: USER_SETTINGS_SET_RECORD_SET_REQUEST,
                            payload: {
                              updatedSet: {
                                ...JSON.parse(JSON.stringify(userSettingsState?.recordSets?.[set])),
                                mapToggle: !userSettingsState?.recordSets?.[set]?.mapToggle
                              },
                              setName: set
                            }
                          });
                        }}
                        variant="outlined">
                        {userSettingsState?.recordSets?.[set]?.mapToggle ? <LabelIcon /> : <LabelClearIcon />}
                      </Button>

                      <Button
                        className="records__set__layer_toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({
                            type: USER_SETTINGS_SET_RECORD_SET_REQUEST,
                            payload: {
                              updatedSet: {
                                ...JSON.parse(JSON.stringify(userSettingsState?.recordSets?.[set])),
                                labelToggle: !userSettingsState?.recordSets?.[set]?.labelToggle
                              },
                              setName: set
                            }
                          });
                        }}
                        variant="outlined">
                        {userSettingsState?.recordSets?.[set]?.labelToggle ? <LayersIcon /> : <LayersClearIcon />}
                      </Button>
                      <div className="records_set_layer_colour">
                        <Button
                          //className={classes.mainHeader}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIndex = colours.indexOf(userSettingsState?.recordSets?.[set]?.color);
                            const nextIndex = (currentIndex + 1) % colours.length;

                            dispatch({
                              type: USER_SETTINGS_SET_RECORD_SET_REQUEST,
                              payload: {
                                updatedSet: {
                                  ...JSON.parse(JSON.stringify(userSettingsState?.recordSets?.[set])),
                                  color: colours[nextIndex]
                                },
                                setName: set
                              }
                            });
                          }}
                          style={{ backgroundColor:  userSettingsState?.recordSets?.[set]?.color}}
                          variant="contained">
                          <ColorLensIcon />
                        </Button>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            /*eslint-disable*/
                            confirm(
                              'Are you sure you want to remove this record set?  The data will persist but you will no longer have this set of filters or the map layer.'
                            )
                          ) {
                            // props.remove(props.setName);
                            dispatch({
                              type: USER_SETTINGS_REMOVE_RECORD_SET_REQUEST,
                              payload: {
                                recordSetName: set
                              }
                            });
                          }
                        }}
                        variant="outlined">
                        <Delete />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <></>
          )
        }
      />
    </div>
  );
};
