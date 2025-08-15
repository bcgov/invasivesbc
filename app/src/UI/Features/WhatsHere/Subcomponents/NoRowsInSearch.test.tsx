import { createMockStore, mockSliceReducer } from 'test/testUtils';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import NoRowsInSearch from './NoRowsInSearch';
import { MemoryRouter } from 'react-router';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';

describe('NoRowsInSearch.tsx', () => {
  const storeWithoutRecordSetToggled = createMockStore({
    ...mockSliceReducer('UserSettings', {
      recordSets: { '1': UserSettings.RecordSet.createDefaultRecordset(RecordSetType.Activity) }
    })
  });

  const recordSet = UserSettings.RecordSet.createDefaultRecordset(RecordSetType.Activity);
  recordSet.mapToggle = true;

  const storeWithRecordSetToggled = createMockStore({
    ...mockSliceReducer('UserSettings', {
      recordSets: { '1': recordSet }
    })
  });

  it('should render with no recordsets warning', () => {
    const { getByRole, getByText } = render(
      <Provider store={storeWithoutRecordSetToggled}>
        <MemoryRouter>
          <NoRowsInSearch />
        </MemoryRouter>
      </Provider>
    );
    expect(getByRole('link')).toBeDefined();
    expect(getByText('There are no Recordsets currently visible on the map.'));
  });

  it('should render with no pointsOfInterest warning', () => {
    const { getByRole, getByText } = render(
      <Provider store={storeWithRecordSetToggled}>
        <MemoryRouter>
          <NoRowsInSearch />
        </MemoryRouter>
      </Provider>
    );
    expect(getByRole('link')).toBeDefined();
    expect(getByText('There are no points of interest in the selected area.'));
  });
});
