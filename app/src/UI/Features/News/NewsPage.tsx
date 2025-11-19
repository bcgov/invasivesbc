import { useState } from 'react';
import newsItems from 'UI/Features/News/newsItems';
import 'UI/Features/News/NewsPage.css';
import NewsArticle, { NewsSubject } from 'interfaces/NewsArticle';
import { BugReport, FiberNew, Update } from '@mui/icons-material';
import { Icon } from '@mui/material';

const NewsPage = () => {
  const BASE_SHOW = 5;
  const [loadMore, setLoadMore] = useState<number>(BASE_SHOW);
  const handleMore = () => setLoadMore((prev) => prev + BASE_SHOW);

  const subjectToIcon = (subject: NewsSubject) => {
    switch (subject) {
      case NewsSubject.New:
        return (
          <Icon aria-label="New Feature Added">
            <FiberNew />
          </Icon>
        );
      case NewsSubject.Update:
        return (
          <Icon aria-label="New Update">
            <Update />
          </Icon>
        );
      case NewsSubject.BugFix:
        return (
          <Icon aria-label="Bug Fix Implemented">
            <BugReport />
          </Icon>
        );
      default:
    }
  };

  return (
    <div id="newsPageContainer">
      <h2 id="newsPageHeader">What's New in InvasivesBC?</h2>
      <div id="newsPageContent">
        {newsItems.map((newsItem: NewsArticle, index) => {
          if (index < loadMore) {
            return (
              <div className="newsListItem" key={index}>
                <div className="newsIcon">{subjectToIcon(newsItem?.subject)}</div>
                <h3 className="newsListItemTitle">{newsItem.title}</h3>
                <p className="newsListDate">
                  Posted:{' '}
                  <time dateTime={newsItem.date.toLocaleDateString()}>{newsItem.date.toLocaleDateString()}</time>
                </p>
                {newsItem.content}
              </div>
            );
          }
        })}
        {newsItems.length > loadMore && (
          <button className="newsPageSeeMore" onClick={handleMore}>
            See more
          </button>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
