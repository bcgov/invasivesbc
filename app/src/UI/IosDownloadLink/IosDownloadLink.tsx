import iosDownload from '/assets/iosDownload.svg';
import { useSelector } from 'utils/use_selector';

const IosDownloadLink = () => {
  const LINK = useSelector((state) => state.Configuration.current.IOS_APP_STORE_URL);

  if (!LINK || LINK === 'unset') return;
  return (
    <a href={LINK} target="_blank" rel="external">
      <img src={iosDownload} alt="Download InvasivesBC For iOS devices" />
    </a>
  );
};

export default IosDownloadLink;
