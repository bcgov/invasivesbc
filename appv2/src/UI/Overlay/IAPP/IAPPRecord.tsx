import React, {useEffect} from 'react';

import './IAPPRecords.css';
import {Route, useHistory, useParams, useRouteMatch} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {selectUserSettings} from 'state/reducers/userSettings';
import {OverlayHeader} from '../OverlayHeader';
import {Button} from '@mui/material';
import {selectIAPPSite} from "../../../state/reducers/iappsite";
import {Summary} from "./Summary";
import {Photos} from "./Photos";
import {IAPP_GET_REQUEST, IAPP_PAN_AND_ZOOM} from "../../../state/actions";

export const IAPPRecord = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const {id} = useParams();

  const settingsState = useSelector(selectUserSettings);
  const IAPPState = useSelector(selectIAPPSite);

  useEffect(() => {
    dispatch({type: IAPP_GET_REQUEST, payload: {iappID: id}});
  }, [id]);


  return (
    <div className="records__activity">
      <OverlayHeader>
      </OverlayHeader>
      <div className="records__activity__header">
        <div className="records__activity_buttons">
          <Button
            variant="contained"
            className="records__activity__photos_button"
            onClick={() => history.push(`/Records/IAPP/${id}/photos`)}>
            Photos
          </Button>
          <Button
            variant="contained"
            className="records__activity__form_button"
            onClick={() => history.push(`/Records/IAPP/${id}/summary`)}>
            Summary
          </Button>
          <Button
            variant="contained"
            className="records__activity__map_button"
            onClick={() => {
              dispatch({type: IAPP_PAN_AND_ZOOM})
              history.push(`/Records/IAPP/${id}/summary`)
            }}>
            Re-center Map
          </Button>
        </div>
      </div>
      <Route
        path="/Records/IAPP/:id/summary"
        render={() => {
          if (IAPPState.failCode === 404) {
            setTimeout(() => {
              history.push('/Records')
            }, 3000)
            return <div>Activity does not exists, redirecting...</div>
          }
          if (
            settingsState.apiDocsWithSelectOptions &&
            settingsState.apiDocsWithViewOptions &&
            IAPPState.loading === false
          )
            return <Summary record={IAPPState.site}/>;
          else return <div>loading</div>;
        }}
      />
      <Route
        path="/Records/IAPP/:id/photos"
        render={() => {
          if (IAPPState?.site) return <Photos
            media={IAPPState.site?.point_of_interest_payload?.importedMedia || []}></Photos>;
          else return <div>loading</div>;
        }}
      />
    </div>
  );
};
