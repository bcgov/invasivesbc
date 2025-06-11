import UserGuideEntry from 'interfaces/UserGuideEntry';
import AndroidDownloadLink from './Images/androidDownload.png';
import { Android } from '@mui/icons-material';

const guideEntries: Array<UserGuideEntry> = [
  {
    title: 'Android Link',
    titleIcon: <Android />,
    content: (
      <>
        <p>Test user guide entry</p>
        <figure>
          <img src={AndroidDownloadLink} alt="Google Store Link" />
          <figcaption>Google Store Link</figcaption>
        </figure>
        <p>Another paragraph</p>
      </>
    )
  }
];

export default guideEntries;
