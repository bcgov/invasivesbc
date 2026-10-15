import { useLocation } from 'react-router';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import './notFoundPage.css';

const NotFoundPage = () => {
  const { pathname } = useLocation();
  return (
    <div id="system-status-404">
      <div className="content">
        <BackButton className="back-btn" />
        <hgroup>
          <h2>404 - Oops, looks like we're lost</h2>
          <p>The resource you're looking for might have been removed, moved, or is temporarily unavailable.</p>
        </hgroup>
        <p className="path">
          <span>URL</span> {pathname}
        </p>
      </div>
    </div>
  );
};
export default NotFoundPage;
