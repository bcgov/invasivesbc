import { render, RenderResult, waitFor } from '@testing-library/react';
import { historySingleton } from 'state/store';
import LegendsPopup from './LegendsPopup';
import { Router } from 'react-router';
import userEvent from '@testing-library/user-event';

describe('LegendsPopup.tsx', () => {
  let utils: RenderResult;

  beforeEach(() => {
    utils = render(
      <Router history={historySingleton}>
        <LegendsPopup />
      </Router>
    );
  });

  it('Should Render', () => {
    const { getByText } = utils;
    expect(getByText(/InvasivesBC Map Legend/)).toBeDefined();
  });

  it('Should Open Map Code list', async () => {
    const { getByText } = utils;
    userEvent.click(getByText('Two Letter Invasive Plant Species Map Codes'));
    await waitFor(() => {
      expect(getByText('Scientific name')).toBeDefined();
    });
  });

  it('Should Display DataBC Layers', async () => {
    const { getByText } = utils;
    userEvent.click(getByText('Source for Layers in the Layer Picker'));
    await waitFor(() => {
      expect(getByText('Layer Picker Label')).toBeDefined();
    });
  });

  it('Should Display Activity Map Layers descriptions', async () => {
    const { getByAltText, getByText } = utils;
    userEvent.click(getByText('InvasivesBC Activity Map Colors'));
    await waitFor(() => {
      expect(getByAltText('Purple records')).toBeDefined();
    });
  });
});
