import { createMockStore, mockState } from 'test/testUtils';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import NoRowsInSearch from './NoRowsInSearch';
import { Router } from 'react-router';
import { historySingleton } from 'state/store';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';

describe('NoRowsInSearch.tsx', () => {
  const storeWithoutRecordSetToggled = createMockStore({
    UserSettings: mockState({
      recordSets: { '1': UserSettings.RecordSet.createDefaultRecordset(RecordSetType.Activity) }
    })
  });

  const recordSet = UserSettings.RecordSet.createDefaultRecordset(RecordSetType.Activity);
  recordSet.mapToggle = true;

  const storeWithRecordSetToggled = createMockStore({
    UserSettings: mockState({
      recordSets: { '1': recordSet }
    })
  });

  it('should render with no recordsets warning', () => {
    const { getByRole, getByText } = render(
      <Provider store={storeWithoutRecordSetToggled}>
        <Router history={historySingleton}>
          <NoRowsInSearch />
        </Router>
      </Provider>
    );
    expect(getByRole('link')).toBeDefined();
    expect(getByText('There are no Recordsets currently visible on the map.'));
  });

  it('should render with no pointsOfInterest warning', () => {
    const { getByRole, getByText } = render(
      <Provider store={storeWithRecordSetToggled}>
        <Router history={historySingleton}>
          <NoRowsInSearch />
        </Router>
      </Provider>
    );
    expect(getByRole('link')).toBeDefined();
    expect(getByText('There are no points of interest in the selected area.'));
  });
});
