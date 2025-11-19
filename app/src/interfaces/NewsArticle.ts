import { ReactNode } from 'react';

enum NewsSubject {
  New,
  Update,
  BugFix
}
enum NewsPlatform {
  BOTH,
  MOBILE,
  WEB
}

type NewsArticle = {
  title: string;
  date: Date;
  content: ReactNode;
  subject: NewsSubject;
  platform: NewsPlatform;
};

export default NewsArticle;
export { NewsSubject, NewsPlatform };
