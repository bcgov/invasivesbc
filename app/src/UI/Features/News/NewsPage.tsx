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

  const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={part + index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#007bff', textDecoration: 'none' }}
          >
            {part}
          </a>
        );
      }
      return <span key={part + index}>{part}</span>;
    });
  };

  return (
    <div id="newsPageContainer">
      <h2 id="newsPageHeader">What's New in InvasivesBC?</h2>
      <div id="newsPageContent">
        {newsItems.map((newsItem: NewsArticle, index) => {
          if (index < loadMore) {
            return (
              <div className="newsListItem" key={newsItem.content.toString()}>
                <div className="newsIcon">{subjectToIcon(newsItem?.subject)}</div>
                <h3 className="newsListItemTitle">{newsItem.title}</h3>
                <p className="newsListDate">
                  Posted:{' '}
                  <time dateTime={newsItem.date.toLocaleDateString()}>{newsItem.date.toLocaleDateString()}</time>
                </p>
                <ul>
                  {newsItem.content.map((content: string) => (
                    <li className="newsListItemContent" key={content}>
                      {renderContentWithLinks(content)}
                    </li>
                  ))}
                </ul>
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
