export enum NewsSubject {
  New,
  Update,
  BugFix
}

type NewsArticle = {
  title: string;
  date: Date;
  content: string[];
  subject: NewsSubject;
};

export default NewsArticle;
