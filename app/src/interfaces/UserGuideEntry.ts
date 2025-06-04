import { NewsPlatform } from './NewsArticle';

interface ReferenceImage {
  imgSource: string;
  caption?: string;
}
interface Content {
  text: Array<string>;
  images?: Array<ReferenceImage>;
}
/**
 * @desc Entries for the User Guides
 * @property { string } title Heading of section
 * @property { titleIcon } String MUI Icon for Accordion
 */
interface UserGuideEntry {
  title: string;
  titleIcon?: string;
  tags: Array<string>;
  content: Array<Content>;
}

export default UserGuideEntry;
