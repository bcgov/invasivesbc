import { render } from '@testing-library/react';
import DisplayComposite from 'UI/Features/LegacyMap/helpers/components/DisplayComposite/DisplayComposite';
import { Provider } from 'react-redux';
import { createMockStore, mockSliceReducer } from 'test/testUtils';

describe('DisplayComposite.tsx', () => {
  const store = createMockStore({
    ...mockSliceReducer('Map', { accuracyToggle: false, positionTracking: true })
  });

  it('should render', () => {
    const { container } = render(
      <Provider store={store}>
        <DisplayComposite />
      </Provider>
    );
    expect(container.querySelector('#map-display-composite')).toBeDefined();
  });
});
