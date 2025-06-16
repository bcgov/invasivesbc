import { ReactElement, ReactNode } from 'react';
import { SvgIconProps } from '@mui/material';


/**
 * @desc Entries for the User Guides
 * @property { string } title Heading of section
 * @property { titleIcon } ReactElement MUI Icon
 */
interface UserGuideEntry {
  title: string;
  titleIcon: ReactElement<SvgIconProps>;
  content: ReactNode;
}

export default UserGuideEntry;
