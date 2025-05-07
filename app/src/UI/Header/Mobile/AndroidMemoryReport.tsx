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
        <dt>total mem MiB</dt>
        <dd>{`${Math.floor(memoryInformation.totalBytes / (1024 * 1024))}`}</dd>
        <dt>available mem MiB</dt>
        <dd>{`${Math.floor(memoryInformation.availableBytes / (1024 * 1024))}`}</dd>
        <dt>low memory condition</dt>
        <dd>{memoryInformation.lowMemoryCondition ? 'YES' : 'NO'}</dd>
      </dl>
    </div>
  );
};
export { AndroidMemoryReport };
