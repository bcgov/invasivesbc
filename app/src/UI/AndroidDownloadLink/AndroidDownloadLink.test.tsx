import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import AndroidDownloadLink from './AndroidDownloadLink';
import { configureStore } from '@reduxjs/toolkit';

const configurationReducer =
  (base_url) =>
  (
    state = {
      current: {
        ANDROID_APP_STORE_URL: base_url
      }
    }
  ) =>
    state;
const createMockStore = (urlValue) =>
  configureStore({
    reducer: {
      Configuration: configurationReducer(urlValue)
    }
  });

describe('AndroidDownloadLink.tsx', () => {
  it('should render null', () => {
    const mockStore = createMockStore('unset');
    const { queryByAltText } = render(
      <Provider store={mockStore}>
        <AndroidDownloadLink />
      </Provider>
    );
    expect(queryByAltText('Download InvasivesBC For Android devices')).toBeNull();
  });
  it('should render with url', () => {
    const url = 'http://localhost:3000';
    const mockStore = createMockStore(url);
    const { getByAltText } = render(
      <Provider store={mockStore}>
        <AndroidDownloadLink />
      </Provider>
    );
    expect(getByAltText('Download InvasivesBC For Android devices')).toBeDefined();
  });
});
