import React, { useEffect } from 'react';

import './Records.css';
import { Route, useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST } from 'state/actions';
import { select } from 'redux-saga/effects';
import { selectUserSettings } from 'state/reducers/userSettings';
import { selectAuth } from 'state/reducers/auth';
import { ActivityForm } from './Activity/Form';
import { selectActivity } from 'state/reducers/activity';

export const Activity = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const settingsState = useSelector(selectUserSettings);
  const authState = useSelector(selectAuth);
  const id = history.location.pathname.split(':')[1]?.split('/')[0];
  const activityState = useSelector(selectActivity);

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }
    if (typeof id === 'string' && id?.length > 0 && settingsState?.activeActivity !== id) {
      dispatch({ type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST, payload: { id: id } });
    }
  }, [id, authState?.authenticated]);

  return (
    <div //onClick={()=> history.goBack()}
      className="records__activity">
      <div className="records__activity__header">
        <div className="records__activity_buttons">
          <div
            className="records__activity__photos_button"
            onClick={() => history.push(history.location.pathname.split(':')[0] + ':' + id + '/photos')}>
            photos
          </div>
          <div
            className="records__activity__form_button"
            onClick={() => history.push(history.location.pathname.split(':')[0] + ':' + id + '/form')}>
            form
          </div>
          <div
            className="records__activity__map_button"
            onClick={() => history.push(history.location.pathname.split(':')[0] + ':' + id + '/map')}>
              map
          </div>
        </div>
      </div>
        <Route
          path="/Records/Activity:id/form"
          render={() => {
            if (activityState?.activity?.activity_id && settingsState.apiDocsWithSelectOptions && settingsState.apiDocsWithViewOptions) return <ActivityForm />;
            else return <div>loading</div>;
          }}
        />

      {settingsState.activeActivity}
    </div>
  );
};
