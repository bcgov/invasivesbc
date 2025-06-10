import { useDispatch, useSelector } from 'utils/use_selector';
import { useEffect, useState } from 'react';
import EventActions from 'state/actions/events/EventActions';
import { LayoutComponent } from 'UI/App';

/** @description Debug component for testing alternative layouts */
const LayoutSwitch = () => {
  const dispatch = useDispatch();
  const layout = useSelector((state) => state.AppMode.layout.layout);

  const [nextLayout, setNextLayout] = useState<LayoutComponent>(
    layout == 'wide-layout' ? 'overlay-layout' : 'wide-layout'
  );

  useEffect(() => {
    setNextLayout(layout == 'wide-layout' ? 'overlay-layout' : 'wide-layout');
  }, [layout]);

  return (
    <button style={{ cursor: 'pointer' }} onClick={() => dispatch(EventActions.setLayoutComponent(nextLayout))}>
      switch to {nextLayout}
    </button>
  );
};

export default LayoutSwitch;
