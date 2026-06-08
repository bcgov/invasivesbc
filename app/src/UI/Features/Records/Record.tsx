import { useEffect, useRef } from 'react';
import 'UI/Features/Records/Record.css';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'utils/use_selector';
import { ActivityForm } from 'UI/Features/Records/Activity/Form';
import { ActivityPhotos } from 'UI/Features/Records/Activity/Photos';
import { Button } from '@mui/material';
import { RENDER_DEBUG } from 'UI/App';
import ActivityActions from 'state/actions/activity/Activity';
import Spinner from 'UI/Reusable/Spinner/Spinner';

const RenderActivityPhotos = () => {
  const activity_id = useSelector((state) => state.ActivityPage?.activity?.activity_id);
  if (activity_id) {
    return <ActivityPhotos />;
  }
  return <Spinner />;
};

const RenderActivityForm = () => {
  const failCode = useSelector((state) => state.ActivityPage?.failCode);
  const activity_id = useSelector((state) => state.ActivityPage?.activity?.activity_id);

  const loading = useSelector((state) => state.ActivityPage?.loading);
  const apiDocsWithSelectOptions = useSelector((state) => state.UserSettings?.apiDocsWithSelectOptions);
  const apiDocsWithViewOptions = useSelector((state) => state.UserSettings?.apiDocsWithViewOptions);

  const navigate = useNavigate();

  if (failCode === 404) {
    setTimeout(() => {
      navigate('/Records');
    }, 3000);
    return <div>Activity does not exist, redirecting...</div>;
  }
  if (activity_id && apiDocsWithSelectOptions && apiDocsWithViewOptions && loading === false) {
    return <ActivityForm />;
  } else {
    return <Spinner />;
  }
};

export const Activity = () => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%cActivity  content render:' + ref.current.toString(), 'color: yellow');
  }

  const navigate = useNavigate();

  const { id, mode } = useParams<{ id: string; mode: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    id && dispatch(ActivityActions.loadActivityIfRequired(id));
  }, [id]);

  return (
    <div>
      <div className="records__activity">
        <div className="records__activity__header">
          <div className="records__activity_buttons">
            <Button
              variant="contained"
              className={'records__activity__photos_button ' + (mode === 'form' ? ' selectedFormTab' : '')}
              onClick={() => navigate(`/Records/LegacyForm/${id}/photos`)}
            >
              Photos
            </Button>
            <Button
              variant="contained"
              className={'records__activity__form_button ' + (mode === 'form' ? ' selectedFormTab' : '')}
              onClick={() => navigate(`/Records/LegacyForm/${id}/form`)}
            >
              Form
            </Button>
          </div>
        </div>
        {mode === 'photos' && <RenderActivityPhotos />}
        {mode === 'form' && <RenderActivityForm />}
      </div>
    </div>
  );
};
