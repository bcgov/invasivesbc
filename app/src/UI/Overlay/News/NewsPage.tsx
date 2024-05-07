import React from 'react';
import './NewsPage.css';

export const NewsPage = (props: any) => {
  const newsItems = [
    {
      title: 'May 7, 2024: Improvements to sorting and filtering',
      content: `
1. Filtering: 

You can now choose AND or OR for most filters (spatial searches are limited to AND for now).


2. Sorting:  
      
•  You can now click column headers on the main records page to sort by that column.  
•  Click again to change direction, and once more to stop sorting.  Note that for certain filter combinations, it is possible that sorting could slow things down.  
•  TIP:  If you find yourself waiting a long time, try adding more filters to narrow down your results and then re-enable sorting.`


    },
    {
      title: 'May 7, 2024:  Launch of the News Page',
      content: 'This page was created to keep you informed of the latest changes and improvements to InvasivesBC.  Check back often for updates!  We will do our best to keep you in the loop.'
    }
  ];
  return (
    <div id="newsPageContainer">
      <div id="newsPageHeader">What's New in InvasivesBC?</div>
      <div id="newsPageContent">
        <ul id="newsList">
          {newsItems.map((newsItem, index) => {
            return (
              <li className='newsListItem' key={index}>
                <h3 className='newsListItemTitle'>{newsItem.title}</h3>
                <p className='newsListItemContent'>{newsItem.content}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
