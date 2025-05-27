import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import IosDownloadLink from './IosDownloadLink';

const configurationReducer =
  (base_url) =>
  (
    state = {
      current: {
        IOS_APP_STORE_URL: base_url
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

describe('IosDownloadLink.tsx', () => {
  it('should render null', () => {
    const mockStore = createMockStore('unset');
    const { queryByAltText } = render(
      <Provider store={mockStore}>
        <IosDownloadLink />
      </Provider>
    );
    expect(queryByAltText('Download InvasivesBC For iOS devices')).toBeNull();
  });
  it('should render with url', () => {
    const url = 'http://localhost:3000';
    const mockStore = createMockStore(url);
    const { getByAltText } = render(
      <Provider store={mockStore}>
        <IosDownloadLink />
      </Provider>
    );
    expect(getByAltText('Download InvasivesBC For iOS devices')).toBeDefined();
  });
});
