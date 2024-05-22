import React from 'react';
import './NewsPage.css';

export const NewsPage = (props: any) => {
  const newsItems = [
    {
      title: 'May 21, 2024: Crash fix for some devices', 
      content: `
• Some users (particularly those on mobile) may have experienced a crash on startup.  This has been resolved.
`
},
    {
      title: 'May 17, 2024: Photo editing, Draft Issue, and note on Decimals in the Chem Treatment Form', 
      content: `
• Photos had a bug where hitting the edit icon to rename them did nothing.  This has been fixed.
• A user reported seeing their drafts in the other recordsets/layers.  They were still in fact drafts and excluded from reports however this was confusing.  This has been fixed.
• Decimals on the Chem Treatment form.  You can enter decimal values such as "0.5" however note that if you try to add one to the middle of a number such as "15" to "1.5" it won't work.  
  This is because there is always a decimal at the end if not specified.  Future versions of this form will make this behaviour less clunky however it is important to note how this works for the time being.
`
},
    {
      title: 'May 14, 2024: Heading Indicator', 
      content: `
• The blue "Find Me"/"Current Location Indicator" dot now includes an arrow that points in the direction you are moving.  
• This is a new and still somewhat experimental feature, however we feel it is useful enough now in its current version to justify releasing. 
• Note that this is not functional on desktop, and works best when outside, moving, and not on WIFI.
• Some devices may have the old blue dot image cached, and will need their browser cache cleared to see the new image.`},
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
