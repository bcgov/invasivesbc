import androidDownload from '/assets/androidDownload.png';
import { useSelector } from 'utils/use_selector';

const AndroidDownloadLink = () => {
  const LINK = useSelector((state) => state.Configuration.current.runtime.ANDROID_APP_STORE_URL);

  if (!LINK || LINK === 'unset') return;
  return (
    <a href={LINK} target="_blank" rel="external">
      <img src={androidDownload} alt="Download InvasivesBC For Android devices" />
    </a>
  );
};

export default AndroidDownloadLink;
