import { CONFIG } from 'state/config';
import iosDownload from '/assets/iosDownload.svg';

const IosDownloadLink = () => {
  const LINK = CONFIG.IOS_APP_STORE_URL ?? '';

  if (LINK === 'unset') return;
  return (
    <a href={LINK} target="_blank" rel="external">
      <img src={iosDownload} alt="Download InvasivesBC For iOS devices" height="55" />
    </a>
  );
};

export default IosDownloadLink;
