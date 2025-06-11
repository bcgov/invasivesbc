import UserGuideEntry from 'interfaces/UserGuideEntry';

/**
 * Notes:
 *  - Wrapping images inside a figure with figcaption will result in predefined consistent style
 *  - Images used in the UserGuide should be imported from './images'
 *  - title keys are wrapped in <h3> elements.
 *  - titleIcon uses any Mui Icon @external {@link https://mui.com/material-ui/material-icons/}
 */
const guideEntries: Array<UserGuideEntry> = [
  // {
  //   title: '',
  //   titleIcon: <MuiIcon />,
  //   content: (
  //    <>
  //       <p>Test user guide entry</p>
  //       <figure>
  //         <img src={AndroidDownloadLink} alt="Google Store Link" />
  //         <figcaption>Google Store Link</figcaption>
  //       </figure>
  //       <p>Another paragraph</p>
  //     </>
  //   )
  // },
];

export default guideEntries;
