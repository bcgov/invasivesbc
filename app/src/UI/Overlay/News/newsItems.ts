import NewsArticle, { NewsSubject } from 'interfaces/NewsArticle';

/**
 * Text content for the '/News' page.
 * Array sorts by date to keep things chronological.
 */
const newsItems: NewsArticle[] = [
  /*
  {
    title: '',
    date: new Date(),
    content: [],
    subject: NewsSubject.
  },
  */
  {
    title: '"PMBC Parcel Cadastre - Private" Data Layer Added',
    date: new Date('October 7, 2024'),
    content: [
      "The 'PMBC Parcel Cadastre - Private' layer has been added to InvasivesBC. Users can now select this option from the layer picker on the main map."
    ],
    subject: NewsSubject.New
  },
  {
    title: 'Recordsets Overriding',
    date: new Date('September 20, 2024'),
    content: [
      'Previously, users encountered a bug where deleting a custom recordset would cause new recordsets to override existing ones. This issue has now been resolved.'
    ],
    subject: NewsSubject.BugFix
  },
  {
    title: 'Biocontrol Filtering',
    date: new Date('September 16, 2024'),
    content: [
      'New "Primary Biocontrol User" role created and has been applied to users currently working with Primary Agents.  Users without this role added will not see Biocontrol Records for primary biocontrol agents.',
      'When creating biocontrol records, the invasive plant chosen in the form will restrict the biocontrol agent drop down menu to only those agents that are relevant for the invasive plant species chosen.  This will help reduce unintentional errors and speed up data entry time.'
    ],
    subject: NewsSubject.Update
  },
  {
    title: 'Draw Tools Duplicating',
    date: new Date('September 2, 2024'),
    content: [
      'Previously, users encountered a bug where the draw tools would duplicate on the map. This issue has now been resolved.'
    ],
    subject: NewsSubject.BugFix
  },

  {
    title: 'Prompt and Alert Interface',
    date: new Date('August 13, 2024'),
    content: [
      'Prompts have been overhauled to ensure a consistent look and feel, provide more details to end users, and enhance the overall user experience.',
      'Fixed a bug where alerts would override each other, causing users to see only the most recent alert.',
      'Alerts have been updated to include additional details through an improved color palette and iconography.'
    ],
    subject: NewsSubject.New
  },
  {
    title: 'GeoTracking draw tool, quality of life updates',
    date: new Date('August 8, 2024'),
    content: [
      'Added a new feature that allows users to draw activity shapes using their current GPS data. You can now enable GeoTracking and walk the perimeter of your worksite to create shapes accurately based on your GPS location.',
      "GeoTracking can now be paused midway, allowing you to edit your current shape without interruption. Additionally, when using the 'Find Me' feature, you can now disable map panning."
    ],
    subject: NewsSubject.New
  },
  {
    title: 'TEMP Point batch uploaded shapes',
    date: new Date('June 20, 2024'),
    content: [
      'Shapes associated with Point batch uploads will now appear as octagons instead of circles. This was done to correct issues with the area of the shape not matching the area entered by the user.'
    ],
    subject: NewsSubject.Update
  },
  {
    title: 'Renaming custom layers/record sets, and boundary check for batch',
    date: new Date('June 13, 2024'),
    content: [
      'When you add a new list of records, you will now be able to rename them. Click the pencil icon next to the layer name to do so.',
      'A version update in the database at some point broke the BC boundary check, which has allowed some records to sneak through that are not in BC. This has been fixed, however, we ask people review what they have submitted and clean up anything that is erroneous.'
    ],
    subject: NewsSubject.Update
  },
  {
    title: 'Crash fix for some devices',
    date: new Date('May 21, 2024'),
    content: [
      'Some users (particularly those on mobile) may have experienced a crash on startup. This has been resolved.'
    ],
    subject: NewsSubject.BugFix
  },
  {
    title: 'Photo editing, Draft Issue, and note on Decimals in the Chem Treatment Form',
    date: new Date('May 17, 2024'),
    content: [
      'Photos had a bug where hitting the edit icon to rename them did nothing. This has been fixed.',
      'A user reported seeing their drafts in the other recordsets/layers. They were still in fact drafts and excluded from reports however this was confusing. This has been fixed.',
      'Decimals on the Chem Treatment form. You can enter decimal values such as "0.5" however note that if you try to add one to the middle of a number such as "15" to "1.5" it won\'t work.',
      'This is because there is always a decimal at the end if not specified. Future versions of this form will make this behaviour less clunky however it is important to note how this works for the time being.'
    ],
    subject: NewsSubject.BugFix
  },
  {
    title: 'Heading Indicator',
    date: new Date('May 14, 2024'),
    content: [
      'The blue "Find Me"/"Current Location Indicator" dot now includes an arrow that points in the direction you are moving.',
      'This is a new and still somewhat experimental feature, however we feel it is useful enough now in its current version to justify releasing.',
      'Note that this is not functional on desktop, and works best when outside, moving, and not on WIFI.',
      'Some devices may have the old blue dot image cached, and will need their browser cache cleared to see the new image.'
    ],
    subject: NewsSubject.Update
  },
  {
    title: 'Improvements to sorting and filtering',
    date: new Date('May 7, 2024'),
    content: [
      'You can now choose AND or OR for most filters (spatial searches are limited to AND for now).',
      'You can now click column headers on the main records page to sort by that column.',
      'Click again to change direction, and once more to stop sorting. Note that for certain filter combinations, it is possible that sorting could slow things down.',
      'TIP: If you find yourself waiting a long time, try adding more filters to narrow down your results and then re-enable sorting.'
    ],
    subject: NewsSubject.Update
  },
  {
    title: 'Launch of the News Page',
    date: new Date('May 7, 2024'),
    content: [
      'This page was created to keep you informed of the latest changes and improvements to InvasivesBC. Check back often for updates! We will do our best to keep you in the loop.'
    ],
    subject: NewsSubject.New
  }
].sort((a: NewsArticle, b: NewsArticle) => (a.date < b.date ? 1 : -1));

export default newsItems;
