import { useEffect } from 'react';
import EventActions from 'state/actions/events/EventActions';
import 'UI/Layout/OverlayLayout/Header/Mobile/AndroidMemoryReport.css';
import { useDispatch, useSelector } from 'utils/use_selector';

const AndroidMemoryReport = () => {
  const memoryInformation = useSelector((state) => state.AppMode.constraints.memory);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(EventActions.deviceMemoryReport());
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      dispatch(EventActions.deviceMemoryReport());
    }, 2000);
    return () => {
      clearInterval(id);
    };
  }, []);

  if (!memoryInformation) {
    return <div className={'memory-report'}>Device Memory Information Not Available</div>;
  }
  return (
    <div className={'memory-report'}>
      <dl>
        <dt className={`${memoryInformation.lowMemoryCondition ? 'red' : 'green'}`}>Device Mem MiB</dt>
        <dd>{`${Math.floor((memoryInformation.totalBytes - memoryInformation.availableBytes) / (1024 * 1024))} / ${Math.floor(memoryInformation.totalBytes / (1024 * 1024))}`}</dd>
        <dt>VM Mem MiB</dt>
        <dd
          className={`${memoryInformation.VMFree < 10 * 1024 * 1024} ? 'red':'green'`}
        >{`${Math.floor((memoryInformation.VMMax - memoryInformation.VMFree) / (1024 * 1024))} / ${Math.floor(memoryInformation.VMMax / (1024 * 1024))}`}</dd>
        <dt>memory class MiB</dt>
        <dd>{`${Math.floor(memoryInformation.largeMemoryClass)}`}</dd>
      </dl>
    </div>
  );
  return null;
};
export { AndroidMemoryReport };
