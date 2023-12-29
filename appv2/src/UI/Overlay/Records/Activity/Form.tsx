import React, { useRef } from 'react';
import FormContainer from './form/FormContainer';
import { useSelector } from 'react-redux';
import './Form.css';
import { ActivitySubtypeShortLabels } from 'sharedAPI';

export const ActivityForm = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%Activity Form render:' + ref.current.toString(), 'color: yellow');

  const { short_id, form_status, activity_type, activity_subtype, form_data, created_by, date_created, updated_by, date_updated, batch_id } =
    useSelector((state: any) => state.ActivityPage?.activity);

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
              <td className={'leftValueCol'}>{new Date(form_data.activity_data.activity_date_time).toLocaleDateString()}</td> <br />
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
              <td className={'rightValueCol'}>{new Date(date_updated? date_updated: date_created).toLocaleDateString()}</td> <br />
            </tr>
            <tr>
              <td className={'rightHeaderCol'}>Batch ID</td>
              <td className={'rightValueCol'}>{batch_id}</td> <br />
            </tr>
          </tbody>
        </table>
      </div>
      <FormContainer />
    </>
  );
};
