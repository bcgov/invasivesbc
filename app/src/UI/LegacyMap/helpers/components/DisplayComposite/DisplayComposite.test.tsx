import { render } from '@testing-library/react';
import DisplayComposite from './DisplayComposite';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const configurationReducer =
  () =>
  (
    state = {
      accuracyToggle: false,
      positionTracking: true
    }
  ) =>
    state;
const createMockStore = () =>
  configureStore({
    reducer: {
      Map: configurationReducer()
    }
  });

describe('DisplayComposite.tsx', () => {
  const store = createMockStore();

  it('should render', () => {
    const { container } = render(
      <Provider store={store}>
        <DisplayComposite />
      </Provider>
    );
    expect(container.querySelector('#map-display-composite')).toBeDefined();
  });
});
