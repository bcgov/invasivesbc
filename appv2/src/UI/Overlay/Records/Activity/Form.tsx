import React, { useRef } from 'react';
import FormContainer from './form/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import './Form.css';
import { ActivitySubtypeShortLabels } from 'sharedAPI';
import { RENDER_DEBUG } from 'UI/App';
import { Button } from '@mui/material';
import { calc_lat_long_from_utm } from 'util/utm';
import { ACTIVITY_UPDATE_GEO_REQUEST } from 'state/actions';

export const ActivityForm = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%c Activity Form render:' + ref.current.toString(), 'color: yellow');

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
    batch_id
  } = useSelector((state: any) => state.ActivityPage?.activity);

  const invasive_plant = useSelector((state: any) => state.ActivityPage?.activity?.invasive_plant);

  const manualUTMEntry = () => {
    let validZone = false;
    let zone;
    let validNorthing = false;
    let northing;
    let validEasting = false;
    let easting;

    while (!validZone) {
      zone = prompt('Enter a valid UTM Zone');
      if(zone === null)
        return;
      if (!isNaN(Number(zone))) {
        validZone = true;
        break;
      }
    }
    if (!validZone) {
      return; // allow for cancel
    }
    while (!validEasting) {
      easting = prompt('Enter a valid UTM Easting');
      if(easting === null)
        return;
      if (!isNaN(Number(easting))) {
        validEasting = true;
        break;
      }
    }
    if (!validEasting) {
      //allow for cancel
      return;
    }
    while (!validNorthing) {
      northing = prompt('Enter a valid UTM Northing');
      if(northing === null)
        return;
      if (!isNaN(Number(northing))) {
        validNorthing = true;
        break;
      }
    }
    if (!validNorthing) {
      return; // allow for cancel
    }

    let result = JSON.parse(JSON.stringify(calc_lat_long_from_utm(Number(zone), Number(easting), Number(northing))));
    const geo: any = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [result[0], result[1]]
      },
      properties: {}
    };

    dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [geo]}})
  };
  return (
    <>
      <div className={'recordHeaderInfo'}>
        <table id="leftTable">
          <tbody>
            <tr>
              <td className={'leftHeaderCol'}>Activity ID:</td>
              <td className={'leftValueCol'}>{short_id}</td> <br />
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Form Status:</td>
              <td className={'leftValueCol'}>{form_status}</td> <br />
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Activity Type:</td>
              <td className={'leftValueCol'}>{activity_type}</td> <br />
            </tr>
            <tr>
              <td className={'leftHeaderCol'}>Activity Sub-type:</td>
              <td className={'leftValueCol'}>{ActivitySubtypeShortLabels[activity_subtype]}</td> <br />
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
              <td className={'rightValueCol'}>{created_by}</td> <br />
            </tr>
            <tr>
              <td className={'rightHeaderCol'}>Created At:</td>
              <td className={'rightValueCol'}>{new Date(date_created).toLocaleDateString()}</td> <br />
            </tr>
            <tr>
              <td className={'rightHeaderCol'}>Updated By:</td>
              <td className={'rightValueCol'}>{updated_by}</td> <br />
            </tr>
            <tr>
              <td className={'rightHeaderCol'}>Updated At:</td>
              <td className={'rightValueCol'}>
                {new Date(received_timestamp ? received_timestamp : date_created).toLocaleDateString()}
              </td>{' '}
              <br />
            </tr>
            <tr>
              <td className={'rightHeaderCol'}>Batch ID</td>
              <td className={'rightValueCol'}>{batch_id}</td> <br />
            </tr>
            {invasive_plant && invasive_plant != '' && (
              <tr>
                <td className={'rightHeaderCol'}>Invasive Plant</td>
                <td className={'rightValueCol'}>{invasive_plant}</td> <br />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Button
        onClick={manualUTMEntry}
        variant="outlined"
        sx={{ backgroundColor: 'white', color: '#003366', fontSize: 24, fontWeight: 'medium' }}>
        Click to enter UTM manually
      </Button>
      <FormContainer />
    </>
  );
};
