import UserGuide from './UserGuide';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserGuideEntry from 'interfaces/UserGuideEntry';

vi.mock('./guideEntries', () => ({
  default: [
    {
      title: 'First Entry Test',
      titleIcon: 'map',
      content: [
        {
          text: [
            ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean est leo, egestas quis ante sit amet, egestas aliquet diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam euismod, justo semper gravida tristique, magna nibh euismod velit, et tempor justo odio et eros. Vestibulum nec neque ultricies felis tristique ornare. Pellentesque pharetra id ipsum a placerat. Aenean vitae ligula maximus nulla pulvinar vehicula ac ut eros. Curabitur mollis pellentesque turpis, a tempus nisi sagittis eget. Praesent elit dui, posuere in blandit vitae, hendrerit quis quam. Aenean tempor vitae leo in eleifend. Fusce ac sagittis lacus. Sed sit amet tristique enim, quis sagittis dui. Aliquam lacinia, est in hendrerit cursus, dui eros rhoncus orci, vitae dictum ex felis id ligula. ',
            ' Nullam id ligula massa. Mauris ac elit quis elit elementum porta. Suspendisse non ullamcorper ante. Ut cursus posuere massa eget sodales. Mauris sit amet leo sit amet quam semper elementum et sed metus. Nulla non sodales diam. Vivamus rutrum pellentesque justo. Pellentesque rhoncus auctor lorem, et imperdiet nisl ultrices ut. Aliquam vitae aliquam tellus. Pellentesque dignissim mauris eget augue accumsan, at vestibulum erat dapibus. Aliquam non aliquam ante. Quisque volutpat, nisi id lacinia tempus, neque urna suscipit leo, ac semper justo justo sit amet nisl. Duis sapien risus, suscipit id eleifend et, venenatis eget ante. Donec vulputate elementum felis sit amet aliquet. Vivamus mollis mattis odio, et posuere dui euismod ornare. Sed nec felis vel turpis aliquet feugiat ut ac dolor. '
          ],
          images: [
            {
              imgSource: '/assets/androidDownload.png',
              caption: 'Android Download Icon'
            }
          ]
        },
        {
          text: [
            ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean est leo, egestas quis ante sit amet, egestas aliquet diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam euismod, justo semper gravida tristique, magna nibh euismod velit, et tempor justo odio et eros. Vestibulum nec neque ultricies felis tristique ornare. Pellentesque pharetra id ipsum a placerat. Aenean vitae ligula maximus nulla pulvinar vehicula ac ut eros. Curabitur mollis pellentesque turpis, a tempus nisi sagittis eget. Praesent elit dui, posuere in blandit vitae, hendrerit quis quam. Aenean tempor vitae leo in eleifend. Fusce ac sagittis lacus. Sed sit amet tristique enim, quis sagittis dui. Aliquam lacinia, est in hendrerit cursus, dui eros rhoncus orci, vitae dictum ex felis id ligula. ',
            ' In maximus volutpat nibh, vitae interdum nisi tincidunt et. Vivamus sit amet lorem magna. Sed tincidunt eleifend ornare. Donec et vehicula odio. Nulla laoreet lectus nec ligula tempor, nec consectetur odio egestas. Mauris diam lectus, eleifend a faucibus sit amet, vestibulum sed erat. Fusce vitae mattis leo, vel feugiat enim. Proin gravida, magna in porta rhoncus, diam erat tincidunt diam, ultrices maximus orci diam sit amet nulla. '
          ],
          images: [
            {
              imgSource: '/assets/iosDownload.png',
              caption: 'iOS Download Icon'
            }
          ]
        }
      ]
    }
  ] as Array<UserGuideEntry>
}));
vi.mock('./faqEntries', () => ({
  default: [
    {
      title: 'First Entry Test',
      titleIcon: 'map',
      content: [
        {
          text: [
            ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean est leo, egestas quis ante sit amet, egestas aliquet diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam euismod, justo semper gravida tristique, magna nibh euismod velit, et tempor justo odio et eros. Vestibulum nec neque ultricies felis tristique ornare. Pellentesque pharetra id ipsum a placerat. Aenean vitae ligula maximus nulla pulvinar vehicula ac ut eros. Curabitur mollis pellentesque turpis, a tempus nisi sagittis eget. Praesent elit dui, posuere in blandit vitae, hendrerit quis quam. Aenean tempor vitae leo in eleifend. Fusce ac sagittis lacus. Sed sit amet tristique enim, quis sagittis dui. Aliquam lacinia, est in hendrerit cursus, dui eros rhoncus orci, vitae dictum ex felis id ligula. ',
            ' Nullam id ligula massa. Mauris ac elit quis elit elementum porta. Suspendisse non ullamcorper ante. Ut cursus posuere massa eget sodales. Mauris sit amet leo sit amet quam semper elementum et sed metus. Nulla non sodales diam. Vivamus rutrum pellentesque justo. Pellentesque rhoncus auctor lorem, et imperdiet nisl ultrices ut. Aliquam vitae aliquam tellus. Pellentesque dignissim mauris eget augue accumsan, at vestibulum erat dapibus. Aliquam non aliquam ante. Quisque volutpat, nisi id lacinia tempus, neque urna suscipit leo, ac semper justo justo sit amet nisl. Duis sapien risus, suscipit id eleifend et, venenatis eget ante. Donec vulputate elementum felis sit amet aliquet. Vivamus mollis mattis odio, et posuere dui euismod ornare. Sed nec felis vel turpis aliquet feugiat ut ac dolor. '
          ],
          images: [
            {
              imgSource: '/assets/androidDownload.png',
              caption: 'Android Download Icon'
            }
          ]
        }
      ]
    }
  ] as Array<UserGuideEntry>
}));
describe('UserGuide.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should render', async () => {
    const { getByText, getAllByRole, getAllByText } = render(<UserGuide />);

    expect(getAllByText('First Entry Test')).toHaveLength(2);

    await userEvent.click(getAllByRole('button')[0]);
    await waitFor(() => {
      expect(getAllByRole('img')).toHaveLength(2);
      expect(getByText(/Nullam id ligula massa. Mauris ac elit quis/)).toBeDefined();
      expect(getByText(/In maximus volutpat nibh, vitae interdum nisi tincidunt et./)).toBeDefined();
    });
  });
});
