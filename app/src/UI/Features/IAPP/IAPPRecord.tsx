import { useEffect } from 'react';

import 'UI/Features/IAPP/IAPPRecords.css';
import { Route, useHistory, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import { Summary } from 'UI/Features/IAPP/Summary';
import { Photos } from 'UI/Features/IAPP/Photos';
import { IAPP_PAN_AND_ZOOM } from 'state/actions';
import IappActions from 'state/actions/activity/Iapp';
import { useSelector } from 'utils/use_selector';

export const IAPPRecord = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);

  const { id } = useParams<{ id: string }>();

  const IAPPState = useSelector((state) => state.IAPPSitePage);

  useEffect(() => {
    if (id && id !== 'undefined') {
      dispatch(IappActions.get(id));
    }
  }, [id]);

  return (
    <div className="records__activity">
      <div className="records__activity__header">
        <div className="records__activity_buttons">
          <Button
            variant="contained"
            className="records__activity__photos_button"
            onClick={() => history.push(`/Records/IAPP/${id}/photos`)}
          >
            Photos
          </Button>
          <Button
            variant="contained"
            className="records__activity__form_button"
            onClick={() => history.push(`/Records/IAPP/${id}/summary`)}
          >
            Summary
          </Button>
          <Button
            variant="contained"
            className="records__activity__map_button"
            onClick={() => {
              dispatch({ type: IAPP_PAN_AND_ZOOM });
              history.push(`/Records/IAPP/${id}/summary`);
            }}
          >
            {isCellPhoneWidth ? 'Center' : `Re-center Map`}
          </Button>
        </div>
      </div>
      <div className="control">
        <Button variant="contained" color="primary" onClick={() => history.goBack()}>
          {'< Back'}
        </Button>
      </div>
      <Route
        path="/Records/IAPP/:id/summary"
        render={() => {
          if (IAPPState?.failCode === 404) {
            setTimeout(() => {
              history.push('/Records');
            }, 3000);
            return <div>Activity does not exist, redirecting...</div>;
          }
          if ((IAPPState?.site as any)?.site_id && !IAPPState.loading) {
            return <Summary record={IAPPState?.site} />;
          } else {
            return <div>loading</div>;
          }
        }}
      />
      <Route
        path="/Records/IAPP/:id/photos"
        render={() => {
          if (IAPPState?.site)
            return <Photos media={IAPPState.site?.point_of_interest_payload?.importedMedia || []}></Photos>;
          else return <div>loading</div>;
        }}
      />
    </div>
  );
};
