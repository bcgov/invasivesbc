import { useRef, useState } from 'react';
import FormContainer from './form/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import './Form.css';

import { ActivitySubtypeShortLabels } from 'sharedAPI';
import { RENDER_DEBUG } from 'UI/App';
import { Button } from '@mui/material';
import { calc_lat_long_from_utm } from 'utils/utm';
import {
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_START,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP,
  MAP_TOGGLE_TRACKING_ON
} from 'state/actions';
import GeoShapes from 'constants/geoShapes';
import { promptRadioInput, promptUtmInput } from 'utils/userPrompts';
import { UtmInputObj } from 'interfaces/prompt-interfaces';

export const ActivityForm = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%c Activity Form render:' + ref.current.toString(), 'color: yellow');

  const [showAuditDialogue, setShowAuditDialogue] = useState(false);

  const dispatch = useDispatch();

  const {
    short_id,
    form_status,
    activity_type,
    activity_subtype,
    form_data,
    created_by,
    date_created,
    updated_by,
    received_timestamp,
    batch_id,
    activity_history
  } = useSelector((state: any) => state.ActivityPage?.activity);

  const invasive_plant = useSelector((state: any) => state.ActivityPage?.activity?.invasive_plant);
  const drawGeometryTracking = useSelector((state: any) => state.Map?.track_me_draw_geo);

  /**
   * @desc Handler for creating a manual UTM Entry initiated by user
   * @TODO Finish flow of function
   */
  const manualUTMEntry = () => {
    const utmCallback = (input: UtmInputObj) => {
      const geo: any = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [input.results[0], input.results[1]]
        },
        properties: {}
      };
    };

    dispatch(
      promptUtmInput({
        title: 'Enter a manual UTM',
        prompt: 'Fill in the fields below to create your own UTM Coordinates',
        callback: utmCallback
      })
    );
  };
  const clickHandler = () => {
    if (drawGeometryTracking.isTracking) {
      dispatch({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP });
    } else {
      const callback = (input: string | number) => {
        dispatch({ type: MAP_TOGGLE_TRACKING_ON });
        dispatch({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_START, payload: { type: input } });
      };
      dispatch(
        promptRadioInput({
          callback,
          options: [GeoShapes.LineString, GeoShapes.Polygon],
          prompt:
            "Select the type of shape you wish to create. If you choose a LineString you'll be able to add a buffer at the end",
          title: 'Are you sure you want to track your path?',
          confirmText: 'Start Tracking'
        })
      );
    }
  };

  return (
    <>
      <div className={'recordHeaderInfo'}>
        <table id="leftTable">
          <tbody>
            <tr>
              <td className={'leftHeaderCol'}>Activity ID:</td>
              <td className={'leftValueCol'}>{short_id}</td>
              <br />
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Form Status:</td>
              <td className={'leftValueCol'}>{form_status}</td>
              <br />
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Activity Type:</td>
              <td className={'leftValueCol'}>{activity_type}</td>
              <br />
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Activity Sub-type:</td>
              <td className={'leftValueCol'}>{ActivitySubtypeShortLabels[activity_subtype]}</td>
              <br />
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Activity Date:</td>
              <td className={'leftValueCol'}>
                {new Date(form_data.activity_data.activity_date_time).toLocaleDateString()}
              </td>{' '}
              <br />
            </tr>
          </tbody>
        </table>
        <table id="rightTable">
          <tbody>
            <tr>
              <td className={'rightHeaderCol'}>Created By:</td>
              <td className={'rightValueCol'}>{created_by}</td>
              <br />
            </tr>
            <tr>
              <td className={'rightHeaderCol'}>Created At:</td>
              <td className={'rightValueCol'}>{new Date(date_created).toLocaleDateString()}</td>
              <br />
            </tr>
            {activity_history?.length > 1 && (
              <>
                <tr>
                  <td className={'rightHeaderCol'}>Updated By:</td>
                  <td className={'rightValueCol'}>{updated_by}</td>
                  <br />
                </tr>
                <tr>
                  <td className={'rightHeaderCol'}>Updated At:</td>
                  <td className={'rightValueCol'}>
                    {new Date(received_timestamp ? received_timestamp : date_created).toLocaleDateString()}
                  </td>{' '}
                  <br />
                </tr>
                <tr>
                  <td className={'rightHeaderCol'}>Audit Info:</td>
                  <td className={'rightValueCol'}>
                    <Button
                      onClick={() => {
                        setShowAuditDialogue(true);
                      }}
                      variant="outlined"
                      sx={{ backgroundColor: 'white', color: '#003366', fontSize: 12, fontWeight: 'medium' }}
                    >
                      Click to view
                    </Button>
                  </td>
                  <br />
                </tr>
              </>
            )}
            <tr>
              <td className={'rightHeaderCol'}>Batch ID</td>
              <td className={'rightValueCol'}>{batch_id}</td>
              <br />
            </tr>
            {invasive_plant && invasive_plant != '' && (
              <tr>
                <td className={'rightHeaderCol'}>Invasive Plant</td>
                <td className={'rightValueCol'}>{invasive_plant}</td>
                <br />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Button
        onClick={manualUTMEntry}
        variant="outlined"
        sx={{ backgroundColor: 'white', color: '#003366', fontSize: 24, fontWeight: 'medium' }}
      >
        Click to enter UTM manually
      </Button>
      <div id="auditInfoDialog" className={showAuditDialogue ? 'showAuditInfoDialog' : 'hideAuditInfoDialog'}>
        <Button onClick={() => setShowAuditDialogue(false)}>Close</Button>
        <ul>
          {activity_history?.map((item, index) => {
            return (
              <>
                <li key={index}>
                  <ul className={'inner_audit_list'}>
                    <li>Version : {item?.version + (item?.iscurrent ? ' (Current) ' : '')}</li>
                    <li>Updated By: {item?.updated_by}</li>
                    <li>Activity Status: {item?.form_status}</li>
                    <li>Created at: {item?.created_timestamp}</li>
                  </ul>
                </li>
                <br />
              </>
            );
          })}
        </ul>
      </div>
      <Button
        onClick={clickHandler}
        variant="outlined"
        sx={{ backgroundColor: 'white', color: '#003366', fontSize: 24, fontWeight: 'medium' }}
      >
        Click to draw a geometry by tracing your GPS movement
      </Button>
      <FormContainer />
    </>
  );
};
