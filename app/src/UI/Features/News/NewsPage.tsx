import { useState } from 'react';
import { BugReport, FiberNew, Update } from '@mui/icons-material';
import newsItems from 'UI/Features/News/newsItems';
import NewsArticle, { NewsSubject } from 'interfaces/NewsArticle';
import Button from 'UI/Reusable/Button/Button';
import OverlayContentWrapper from 'UI/Reusable/OverlayContentWrapper/OverlayContentWrapper';
import 'UI/Features/News/NewsPage.css';

const NewsPage = () => {
  const BASE_SHOW = 5;
  const [loadMore, setLoadMore] = useState<number>(BASE_SHOW);
  const handleMore = () => setLoadMore((prev) => prev + BASE_SHOW);

  const subjectToIcon = (subject: NewsSubject) => {
    switch (subject) {
      case NewsSubject.New:
        return <FiberNew aria-label="New Feature Added" />;
      case NewsSubject.Update:
        return <Update aria-label="New Update" />;
      case NewsSubject.BugFix:
        return <BugReport aria-label="Bug Fix Implemented" />;
      default:
        return null;
    }
  };

  return (
    <OverlayContentWrapper>
      <div id="news-page">
        <h2>What's New in InvasivesBC?</h2>
        <div className="content">
          {newsItems.map((newsItem: NewsArticle, index) => {
            if (index < loadMore) {
              const date = newsItem.date.toLocaleDateString();
              return (
                <div className="entry" key={index}>
                  <div className="icon">{subjectToIcon(newsItem?.subject)}</div>
                  <hgroup>
                    <h3>{newsItem.title}</h3>
                    <p className="date">
                      Posted: <time dateTime={date}>{date}</time>
                    </p>
                  </hgroup>
                  {newsItem.content}
                </div>
              );
            }
          })}
          {newsItems.length > loadMore && (
            <Button variant="contained" className="news-page-see-more" onClick={handleMore}>
              See more
            </Button>
          )}
        </div>
      </div>
    </OverlayContentWrapper>
  );
};

export default NewsPage;
