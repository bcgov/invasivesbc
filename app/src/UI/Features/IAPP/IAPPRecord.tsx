import { useEffect } from 'react';

import 'UI/Features/IAPP/IAPPRecords.css';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import { Summary } from 'UI/Features/IAPP/Summary';
import { Photos } from 'UI/Features/IAPP/Photos';
import IappActions from 'state/actions/activity/Iapp';
import { useSelector } from 'utils/use_selector';
import MapActions from 'state/actions/map';
import { ArrowBackIos } from '@mui/icons-material';

const RenderIAPPPhotos = () => {
  const IAPPState = useSelector((state) => state.IAPPSitePage);

  if (IAPPState?.site) return <Photos media={IAPPState.site?.point_of_interest_payload?.importedMedia || []}></Photos>;
  else return <div>loading</div>;
};
const RenderIAPPSummary = () => {
  const navigate = useNavigate();

  const IAPPState = useSelector((state) => state.IAPPSitePage);

  if (IAPPState?.failCode === 404) {
    setTimeout(() => {
      navigate('/Records');
    }, 3000);
    return <div>Activity does not exist, redirecting...</div>;
  }
  if ((IAPPState?.site as any)?.site_id && !IAPPState.loading) {
    return <Summary record={IAPPState?.site} />;
  } else {
    return <div>loading</div>;
  }
};

export const IAPPRecord = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);

  const { id, mode } = useParams<{ id: string; mode: string }>();

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
            onClick={() => navigate(`/Records/IAPP/${id}/photos`)}
          >
            Photos
          </Button>
          <Button
            variant="contained"
            className="records__activity__form_button"
            onClick={() => navigate(`/Records/IAPP/${id}/summary`)}
          >
            Summary
          </Button>
          <Button
            variant="contained"
            className="records__activity__map_button"
            onClick={() => {
              dispatch(MapActions.panToIAPP());
              navigate(`/Records/IAPP/${id}/summary`);
            }}
          >
            {isCellPhoneWidth ? 'Center' : `Re-center Map`}
          </Button>
        </div>
      </div>
      <div className="control">
        <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
          <ArrowBackIos /> Back
        </Button>
      </div>

      {mode === 'photos' && <RenderIAPPPhotos />}
      {mode === 'summary' && <RenderIAPPSummary />}
    </div>
  );
};
