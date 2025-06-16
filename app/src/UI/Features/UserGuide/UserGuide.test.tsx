import { Map } from '@mui/icons-material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserGuideEntry from 'interfaces/UserGuideEntry';
import androidIcon from './images/androidDownload.png';

describe('UserGuide.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.resetModules();
    vi.doMock('./faqEntries', () => ({
      default: [
        {
          title: 'First Entry Test',
          titleIcon: <Map />,
          content: (
            <>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean est leo, egestas quis ante sit amet,
                egestas aliquet diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam euismod,
                justo semper gravida tristique, magna nibh euismod velit, et tempor justo odio et eros. Vestibulum nec
                neque ultricies felis tristique ornare. Pellentesque pharetra id ipsum a placerat. Aenean vitae ligula
                maximus nulla pulvinar vehicula ac ut eros. Curabitur mollis pellentesque turpis, a tempus nisi sagittis
                eget. Praesent elit dui, posuere in blandit vitae, hendrerit quis quam. Aenean tempor vitae leo in
                eleifend.
              </p>
              <figure>
                <img src={androidIcon} />
                <figcaption>Android Icon</figcaption>
              </figure>
              <figure>
                <img src={androidIcon} />
                <figcaption>Android Icon</figcaption>
              </figure>
            </>
          )
        }
      ] as Array<UserGuideEntry>
    }));

    vi.doMock('./guideEntries', () => ({
      default: [
        {
          title: 'Second Entry Test',
          titleIcon: <Map />,
          content: (
            <>
              <p>
                Mauris ac elit quis elit elementum porta. Suspendisse non ullamcorper ante. Ut cursus posuere massa eget
                sodales. Mauris sit amet leo sit amet quam semper elementum et sed metus. Nulla non sodales diam.
                Vivamus rutrum pellentesque justo. Pellentesque rhoncus auctor lorem, et imperdiet nisl ultrices ut.
                Aliquam vitae aliquam tellus. Pellentesque dignissim mauris eget augue accumsan, at vestibulum erat
                dapibus. Aliquam non aliquam ante. Quisque volutpat, nisi id lacinia tempus, neque urna suscipit leo, ac
                semper justo justo sit amet nisl. Duis sapien risus, suscipit id eleifend et, venenatis eget ante. Donec
                vulputate elementum felis sit amet aliquet. Vivamus mollis mattis odio, et posuere dui euismod ornare.
                Sed nec felis vel turpis aliquet feugiat ut ac dolor.
              </p>
              <figure>
                <img src={androidIcon} />
                <figcaption>Android Icon</figcaption>
              </figure>
              <figure>
                <img src={androidIcon} />
                <figcaption>Android Icon</figcaption>
              </figure>
            </>
          )
        }
      ] as Array<UserGuideEntry>
    }));
  });

  it('should render', async () => {
    const UserGuide = await import('./UserGuide').then((m) => m.default);
    const { getByText, getAllByRole, getAllByText } = render(<UserGuide />);

    expect(getAllByText('First Entry Test')).toHaveLength(1);
    expect(getAllByText('Second Entry Test')).toHaveLength(1);

    await userEvent.click(getAllByRole('button')[0]);
    await waitFor(() => {
      expect(getAllByRole('img')).toHaveLength(2);
      expect(getByText(/Pellentesque dignissim mauris eget augue accumsan/)).toBeDefined();
    });
  });
});
