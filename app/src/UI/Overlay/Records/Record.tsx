import { useRef } from 'react';

import './Records.css';
import { Route, useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { ActivityForm } from './Activity/Form';
import { ActivityPhotos } from './Activity/Photos';
import { OverlayHeader } from '../OverlayHeader';
import { Button } from '@mui/material';
import { RENDER_DEBUG } from 'UI/App';

export const Activity = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%cActivity  content render:' + ref.current.toString(), 'color: yellow');
  }
  const urlFromAppModeState = useSelector((state: any) => state.AppMode?.url);

  const history = useHistory();
  const id = history.location.pathname.split(':')[1]?.split('/')[0];
  const failCode = useSelector((state: any) => state.ActivityPage?.failCode);
  const activity_ID = useSelector((state: any) => state.ActivityPage?.activity?.activity_id);

  const loading = useSelector((state: any) => state.ActivityPage?.loading);
  const apiDocsWithSelectOptions = useSelector((state: any) => state.UserSettings?.apiDocsWithSelectOptions);
  const apiDocsWithViewOptions = useSelector((state: any) => state.UserSettings?.apiDocsWithViewOptions);

  return (
    <div className="records__activity">
      <OverlayHeader />
      <div className="records__activity__header">
        <div className="records__activity_buttons">
          <Button
            variant="contained"
            className={
              'records__activity__photos_button ' + (urlFromAppModeState?.includes('photos') ? ' selectedFormTab' : '')
            }
            onClick={() => history.push(history.location.pathname.split(':')[0] + ':' + id + '/photos')}
          >
            Photos
          </Button>
          <Button
            variant="contained"
            className={
              'records__activity__form_button ' + (urlFromAppModeState?.includes('form') ? ' selectedFormTab' : '')
            }
            onClick={() => history.push(history.location.pathname.split(':')[0] + ':' + id + '/form')}
          >
            Form
          </Button>
        </div>
      </div>
      <Route
        path="/Records/Activity:id/form"
        render={() => {
          if (failCode === 404) {
            setTimeout(() => {
              history.push('/Records');
            }, 3000);
            return <div>Activity does not exists, redirecting...</div>;
          }
          if (activity_ID && apiDocsWithSelectOptions && apiDocsWithViewOptions && loading === false)
            return <ActivityForm />;
          else return <div>loading</div>;
        }}
      />
      <Route
        path="/Records/Activity:id/photos"
        render={() => {
          if (activity_ID) return <ActivityPhotos />;
          else return <div>loading</div>;
        }}
      />
    </div>
  );
};
