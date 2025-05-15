import { useDispatch, useSelector } from 'utils/use_selector';
import { useEffect } from 'react';
import EventActions from 'state/actions/events/EventActions';
import './AndroidMemoryReport.css';

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
        <dt>Native PSS MiB</dt>
        <dd>{`${Math.floor(memoryInformation.nativePss / 1024)} MiB`}</dd>
        <dt>Native Private Dirty MiB</dt>
        <dd>{`${Math.floor(memoryInformation.nativePrivateDirty / 1024)} MiB`}</dd>
        <dt>Native Shared Dirty MiB</dt>
        <dd>{`${Math.floor(memoryInformation.nativeSharedDirty / 1024)} MiB`}</dd>
        <dt>Thread Count</dt>
        <dd>{memoryInformation.threadCount}</dd>
      </dl>
    </div>
  );
};
export { AndroidMemoryReport };
