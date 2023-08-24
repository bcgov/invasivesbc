import React, { useEffect } from 'react';

import './Records.css';
import { Route, useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { ACTIVITY_SAVE_REQUEST, ACTIVITY_SUBMIT_REQUEST, USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST } from 'state/actions';
import { select } from 'redux-saga/effects';
import { selectUserSettings } from 'state/reducers/userSettings';
import { selectAuth } from 'state/reducers/auth';
import { ActivityForm } from './Activity/Form';
import { selectActivity } from 'state/reducers/activity';
import { ActivityPhotos } from './Activity/Photos';
import { OverlayHeader } from '../OverlayHeader';
import { Button } from '@mui/material';

export const Activity = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const settingsState = useSelector(selectUserSettings);
  const authState = useSelector(selectAuth);
  const id = history.location.pathname.split(':')[1]?.split('/')[0];
  const activityState = useSelector(selectActivity);

  return (
    <div className="records__activity">
      <OverlayHeader>
        <Button onClick={() => {dispatch({type: ACTIVITY_SAVE_REQUEST, payload: activityState?.activity?.activity_id})}} variant="contained">SAVE TEH FORM</Button>
        <Button onClick={() => {dispatch({type: ACTIVITY_SUBMIT_REQUEST, payload: activityState?.activity?.activity_id})}} variant="contained">SUBMIT TEH FORM</Button>
        </OverlayHeader>
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
          if (
            activityState?.activity?.activity_id &&
            settingsState.apiDocsWithSelectOptions &&
            settingsState.apiDocsWithViewOptions &&
            activityState.loading === false
          )
            return <ActivityForm />;
          else return <div>loading</div>;
        }}
      />
      <Route
        path="/Records/Activity:id/photos"
        render={() => {
          if (activityState?.activity?.activity_id) return <ActivityPhotos />;
          else return <div>loading</div>;
        }}
      />
    </div>
  );
};
