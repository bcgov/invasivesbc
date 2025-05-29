import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore, DEFAULT_TEST_CONFIGURATION, mockSliceReducer } from 'test/testUtils';
import AndroidDownloadLink from 'UI/Reusable/AndroidDownloadLink/AndroidDownloadLink';

describe('AndroidDownloadLink.tsx', () => {
  const createStore = (base_url: string) =>
    createMockStore({
      ...mockSliceReducer('Configuration', {
        current: {
          build: DEFAULT_TEST_CONFIGURATION.build,
          features: DEFAULT_TEST_CONFIGURATION.features,
          runtime: { ...DEFAULT_TEST_CONFIGURATION.runtime, ANDROID_APP_STORE_URL: base_url }
        }
      })
    });

  it('should render null', () => {
    const mockStore = createStore('unset');
    const { queryByAltText } = render(
      <Provider store={mockStore}>
        <AndroidDownloadLink />
      </Provider>
    );
    expect(queryByAltText('Download InvasivesBC For Android devices')).toBeNull();
  });
  it('should render with url', () => {
    const url = 'http://localhost:3000';
    const mockStore = createStore(url);
    const { getByAltText } = render(
      <Provider store={mockStore}>
        <AndroidDownloadLink />
      </Provider>
    );
    expect(getByAltText('Download InvasivesBC For Android devices')).toBeDefined();
  });
});
