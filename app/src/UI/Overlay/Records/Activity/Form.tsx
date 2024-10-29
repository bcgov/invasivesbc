import { useRef, useState } from 'react';
import FormContainer from './form/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import './Form.css';

import { ActivitySubtypeShortLabels } from 'sharedAPI';
import { RENDER_DEBUG } from 'UI/App';
import { Button } from '@mui/material';
import { ACTIVITY_UPDATE_GEO_REQUEST, MAP_TOGGLE_TRACKING_ON } from 'state/actions';
import GeoShapes from 'constants/geoShapes';
import { UtmInputObj } from 'interfaces/prompt-interfaces';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import Prompt from 'state/actions/prompts/Prompt';
import RecordHistory from '../RecordHistory/RecordHistory';

export const ActivityForm = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%c Activity Form render:' + ref.current.toString(), 'color: yellow');
  }
  const closeRecordHistoryModal = () => setShowRecordHistory(false);
  const [showRecordHistory, setShowRecordHistory] = useState(false);

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
   */
  const manualUTMEntry = () => {
    const utmCallback = (input: UtmInputObj) => {
      const geo: any = {
        type: 'Feature',
        geometry: {
          type: GeoShapes.Point,
          coordinates: [input.results[0], input.results[1]]
        },
        properties: {}
      };
      dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [geo] } });
    };

    dispatch(
      Prompt.utm({
        title: 'Enter a manual UTM',
        prompt: 'Fill in the fields below to create your own UTM Coordinates',
        callback: utmCallback
      })
    );
  };
  const clickHandler = () => {
    if (drawGeometryTracking.isTracking) {
      dispatch(GeoTracking.stop());
    } else {
      const callback = (input: string | number) => {
        dispatch({ type: MAP_TOGGLE_TRACKING_ON });
        dispatch(GeoTracking.start(input as GeoShapes));
      };
      dispatch(
        Prompt.radio({
          callback,
          options: [GeoShapes.LineString, GeoShapes.Polygon],
          prompt: [
            'You are about to enable GeoTracking, a tool that uses GPS coordinates to draw a shape on the map.',
            'To complete the shape, select the GeoTracking button again.'
          ],
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
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Form Status:</td>
              <td className={'leftValueCol'}>{form_status}</td>
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Activity Type:</td>
              <td className={'leftValueCol'}>{activity_type}</td>
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Activity Sub-type:</td>
              <td className={'leftValueCol'}>{ActivitySubtypeShortLabels[activity_subtype]}</td>
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Activity Date:</td>
              <td className={'leftValueCol'}>
                {new Date(form_data.activity_data.activity_date_time).toLocaleDateString()}
              </td>
            </tr>
          </tbody>
        </table>
        <table id="rightTable">
          <tbody>
            <tr>
              <td className={'rightHeaderCol'}>Created By:</td>
              <td className={'rightValueCol'}>{created_by}</td>
            </tr>
            <tr>
              <td className={'rightHeaderCol'}>Created At:</td>
              <td className={'rightValueCol'}>{new Date(date_created).toLocaleDateString()}</td>
            </tr>
            {activity_history?.length > 1 && (
              <>
                <tr>
                  <td className={'rightHeaderCol'}>Updated By:</td>
                  <td className={'rightValueCol'}>{updated_by}</td>
                </tr>
                <tr>
                  <td className={'rightHeaderCol'}>Updated At:</td>
                  <td className={'rightValueCol'}>
                    {new Date(received_timestamp ?? date_created).toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <td className={'rightHeaderCol'}>Record History:</td>
                  <td className={'rightValueCol'}>
                    <Button
                      onClick={setShowRecordHistory.bind(this, true)}
                      variant="outlined"
                      sx={{ color: '#003366', fontSize: 12 }}
                    >
                      Click to view
                    </Button>
                  </td>
                </tr>
              </>
            )}
            <tr>
              <td className={'rightHeaderCol'}>Batch ID</td>
              <td className={'rightValueCol'}>{batch_id}</td>
            </tr>
            {invasive_plant && invasive_plant != '' && (
              <tr>
                <td className={'rightHeaderCol'}>Invasive Plant</td>
                <td className={'rightValueCol'}>{invasive_plant}</td>
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
      <RecordHistory
        show={showRecordHistory}
        handleClick={closeRecordHistoryModal}
        activityHistory={activity_history}
      />
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
