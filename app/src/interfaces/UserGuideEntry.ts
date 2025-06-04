import { NewsPlatform } from './NewsArticle';

/**
 * @desc Entries for the User Guides
 * @property { string } title Heading of section
 * @property { titleIcon } String MUI Icon for Accordion
 */
interface UserGuideEntry {
  title: string;
  titleIcon?: string;
  tags: Array<string>;
  platform: NewsPlatform;
  content: [
    {
      text: Array<string>;
      images?: [
        {
          imgSource: string;
          caption?: string;
        }
      ];
    }
  ];
}

export default UserGuideEntry;
