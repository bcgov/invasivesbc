import copyGeom from './pictures/copy-geometry-button.png';
import mostRecentObservations from './pictures/most-recent-observations.png';
import NewsArticle, { NewsPlatform, NewsSubject } from 'interfaces/NewsArticle';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import measureToolEx from './pictures/measuring-tools.png';
import mapSearch from './pictures/map-search.png';
import mockRecordSearch from './pictures/record-search-with-mock-result.png';
import zoiIcon from './pictures/zones-of-interest-icon.png';
import zonesOfInterest from './pictures/zones-of-interest.png';

/**
 * Text content for the '/News' page.
 * Array sorts by date to keep things chronological.
 */
const newsItems: NewsArticle[] = [
  /*
  {
    title: '',
    date: new Date(),
    content: <></>,
    subject: NewsSubject.,
    platform: NewsPlatform.
  },
  */
  {
    title: 'Major Version Release',
    date: new Date('Dec 1, 2026'),
    content: (
      <div className="content">
        <p>
          We are pleased to announce a major release of InvasivesBC. We have been working hard behind the scenes to
          deliver a richer experience for our users
        </p>
        <section>
          <h4>What's Here Improvements</h4>
          <ul>
            <li>
              <b>No more size limits:</b> You can now inspect areas of any size without hitting a cap.
            </li>
            <li>
              <b>Faster/consistent load times:</b> Results appear much quicker when querying an area.
            </li>
            <li>
              <b>Clearer plant breakdowns:</b> Plant lists are now organized into three distinct categories, Species
              Positive, Species Negative, and Species Treated.
            </li>
            <li>
              <b>Back-to-back drawing:</b> Jump straight from viewing on “What's Here” result to drawing your next
              search area without extra clicks.
            </li>
          </ul>
        </section>
        <section>
          <h4>Forms and Photo Uploads</h4>
          <ul>
            <li>
              <b>Fresh look and improved performance:</b> Activity Forms feature a cleaner design and respond faster
              while you work.
            </li>
            <li>
              <b>No more “ghost” submission errors:</b> Improved Form validation ensures that if something prevents you
              from submitting a record, you'll clearly see what needs to be fixed
            </li>
            <li>
              <b>Track changes over time:</b> Enhanced Record Versioning lets you view a clear history of edits directly
              inside the form.
            </li>
            <li>
              <b>Full-size photo viewing:</b> Click into Uploaded record Photos to view them in larger, full-size
              detail.
            </li>
          </ul>
        </section>
        <section>
          <h4>Recordsets</h4>
          <ul>
            <li>
              <b>Filter by employer</b>: View and filter records by Employer directly in your recordset tables.
            </li>
            <li>
              <b>Refreshed table design</b>: Recordset tables have been updated for easier reading and navigation
            </li>
          </ul>
        </section>
        <section>
          <h4>Teams (Early Access)</h4>
          <ul>
            <li>
              <b>Build your team:</b> Data Managers and Administrators can now create teams and invite members from
              their agency or employer. Once invited, team members simply accept the invitation to join.
            </li>
            <li>
              <b>Coming soon:</b> We are actively building permissions that will allow Team Leaders to edit records
              belonging to their team members. You can set up your teams now so you're ready as soon as those tools go
              live.
            </li>
          </ul>
        </section>
        <section>
          <h4>Maps and Spatial Tools</h4>
          <ul>
            <li>
              <b>Measure distances on the map:</b> Use the measuring tool to easily calculate the distance between
              locations, along trails, or across areas
            </li>
            <li>
              <b>Explore 'Zones of Interest' (Early Access)</b>: Select predefined areas directly on the map to
              instantly view a summary of records within that zone. (We'll continue expanding this feature in updates)
            </li>
            <li>
              <b>More accurate map markers:</b> Map markers now sit directly inside the actual boundaries of an area
              rather than at a mathematical centre point, preventing pins from appearing 'off course' or outside oddly
              shapes zones.
            </li>
          </ul>
          <figure>
            <img src={zoiIcon} alt="Zones of Interest Icon" />
            <figcaption>[Figure 1: Zones of Interest toggle]</figcaption>
          </figure>
          <figure>
            <img src={zonesOfInterest} alt="Zones of Interest Map display" />
            <figcaption>[Figure 2: Zones of Interest]</figcaption>
          </figure>
          <figure>
            <img src={measureToolEx} alt="Measuring tool example" />
            <figcaption>[Figure 3: Measuring tools]</figcaption>
          </figure>
        </section>
        <section>
          <h4>Record Search</h4>
          <ul>
            <li>
              <b>Search for records by ID:</b> Quicky find a specific InvasivesBC or IAPP record by typing their ID
              directly into the search bar
            </li>
            <li>
              <b>Remember your last search type:</b> The search tool now automatically saves your last-used search
              option, and provides a simple menu for when you want to switch to a different one
            </li>
          </ul>
          <figure>
            <img src={mockRecordSearch} alt="Record Search with result" />
            <figcaption>[Figure 4: Record search]</figcaption>
          </figure>
          <figure>
            <img src={mapSearch} alt="Map Search Tool displaying mode" />
            <figcaption>[Figure 5: Map search modes]</figcaption>
          </figure>
        </section>
        <p>
          If you have any concerns or wish to report a bug, please contact us at{' '}
          <a href="mailto:InvasivesBC@gov.bc.ca">InvasivesBC@gov.bc.ca</a>
        </p>
      </div>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Feature: "Copy Geometry"',
    date: new Date('Nov 18, 2025'),
    content: (
      <>
        <p>
          When filling out Invasive BC forms, users can now select an existing feature on the map and apply it directly
          to their form.
        </p>
        <img src={copyGeom} />
      </>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Feature: "Most Recent Observations"',
    date: new Date('Nov 18, 2025'),
    content: (
      <>
        <p>
          When working with recordsets, users can now use the "Most Recent Observations" filter to remove historical
          observation data from the results.
        </p>
        <img src={mostRecentObservations} />
      </>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Feature: "Global Activity Filters"',
    date: new Date('Nov 18, 2025'),
    content: (
      <ul>
        <li>
          When viewing features on the map, users can apply a global "Activity Type" filter from the layer picker under
          "Recordset Layers" to reduce the number of items displayed.
        </li>
        <li>Global filters do not affect the data returned in a recordset.</li>
      </ul>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'InvasivesBC is in the BCGW',
    date: new Date('May 6, 2025'),
    content: (
      <ul>
        <li>
          We are excited to announce that the InvasivesBC observations data layer is now available in the BC Geographic
          Warehouse. This new layer includes data on observations for invasive plants in BC.
        </li>
        <li>
          More information on the layer{' '}
          <a href="https://catalogue.data.gov.bc.ca/dataset/invasive-species-observations">can be found here</a>.
        </li>
      </ul>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Updated Ministry names',
    date: new Date('December 13, 2024'),
    content: (
      <ul>
        <li>
          We have updated the descriptions of certain ministry names in our system to align with recent changes in
          government nomenclature. While the underlying codes remain unchanged, the descriptions displayed in relevant
          contexts have been revised to reflect the updated ministry names accurately. This ensures that our system
          stays current and consistent with official terminology.
        </li>
        <li>
          Ministry names{' '}
          <a href="https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries">
            can be found here
          </a>
          .
        </li>
      </ul>
    ),
    subject: NewsSubject.Update,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Layer Picker Update',
    date: new Date('October 24, 2024'),
    content: (
      <p>
        The LayerPicker in InvasivesBC has been updated. Along with a new look, users can now enable Recordset layers
        directly from it. These are some of the initial changes for upcoming features.
      </p>
    ),
    subject: NewsSubject.Update,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Feature: "Record History"',
    date: new Date('October 8, 2024'),
    content: (
      <p>
        Users can view a record's update history by selecting the "Record History" button at the top of the form. This
        button is visible only if the record has updates.
      </p>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: '"PMBC Parcel Cadastre - Private" Data Layer Added',
    date: new Date('October 7, 2024'),
    content: (
      <p>
        The 'PMBC Parcel Cadastre - Private' layer has been added to InvasivesBC. Users can now select this option from
        the layer picker on the main map.
      </p>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Recordsets Overriding',
    date: new Date('September 20, 2024'),
    content: (
      <p>
        Previously, users encountered a bug where deleting a custom recordset would cause new recordsets to override
        existing ones. This issue has now been resolved.
      </p>
    ),
    subject: NewsSubject.BugFix,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Biocontrol Filtering',
    date: new Date('September 16, 2024'),
    content: (
      <ul>
        <li>
          New "Primary Biocontrol User" role created and has been applied to users currently working with Primary
          Agents. Users without this role added will not see Biocontrol Records for primary biocontrol agents.
        </li>
        <li>
          When creating biocontrol records, the invasive plant chosen in the form will restrict the biocontrol agent
          drop down menu to only those agents that are relevant for the invasive plant species chosen. This will help
          reduce unintentional errors and speed up data entry time.
        </li>
      </ul>
    ),
    subject: NewsSubject.Update,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Draw Tools Duplicating',
    date: new Date('September 2, 2024'),
    content: (
      <p>
        Previously, users encountered a bug where the draw tools would duplicate on the map. This issue has now been
        resolved.
      </p>
    ),
    subject: NewsSubject.BugFix,
    platform: NewsPlatform.BOTH
  },

  {
    title: 'Prompt and Alert Interface',
    date: new Date('August 13, 2024'),
    content: (
      <ul>
        <li>
          Prompts have been overhauled to ensure a consistent look and feel, provide more details to end users, and
          enhance the overall user experience.
        </li>
        <li>Fixed a bug where alerts would override each other, causing users to see only the most recent alert.</li>
        <li>
          Alerts have been updated to include additional details through an improved color palette and iconography.
        </li>
      </ul>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'GeoTracking draw tool, quality of life updates',
    date: new Date('August 8, 2024'),
    content: (
      <ul>
        <li>
          Added a new feature that allows users to draw activity shapes using their current GPS data. You can now enable
          GeoTracking and walk the perimeter of your worksite to create shapes accurately based on your GPS location.
        </li>
        <li>
          GeoTracking can now be paused midway, allowing you to edit your current shape without interruption.
          Additionally, when using the "Find Me" feature, you can now disable map panning.
        </li>
      </ul>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'TEMP Point batch uploaded shapes',
    date: new Date('June 20, 2024'),
    content: (
      <p>
        Shapes associated with Point batch uploads will now appear as octagons instead of circles. This was done to
        correct issues with the area of the shape not matching the area entered by the user.
      </p>
    ),
    subject: NewsSubject.Update,
    platform: NewsPlatform.WEB
  },
  {
    title: 'Renaming custom layers/record sets, and boundary check for batch',
    date: new Date('June 13, 2024'),
    content: (
      <ul>
        <li>
          When you add a new list of records, you will now be able to rename them. Click the pencil icon next to the
          layer name to do so.
        </li>
        <li>
          A version update in the database at some point broke the BC boundary check, which has allowed some records to
          sneak through that are not in BC. This has been fixed, however, we ask people review what they have submitted
          and clean up anything that is erroneous.
        </li>
      </ul>
    ),
    subject: NewsSubject.Update,
    platform: NewsPlatform.WEB
  },
  {
    title: 'Crash fix for some devices',
    date: new Date('May 21, 2024'),
    content: (
      <p>Some users (particularly those on mobile) may have experienced a crash on startup. This has been resolved.</p>
    ),
    subject: NewsSubject.BugFix,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Photo editing, Draft Issue, and note on Decimals in the Chem Treatment Form',
    date: new Date('May 17, 2024'),
    content: (
      <ul>
        <li>Photos had a bug where hitting the edit icon to rename them did nothing. This has been fixed.</li>
        <li>
          A user reported seeing their drafts in the other recordsets/layers. They were still in fact drafts and
          excluded from reports however this was confusing. This has been fixed.
        </li>
        <li>
          Decimals on the Chem Treatment form. You can enter decimal values such as "0.5" however note that if you try
          to add one to the middle of a number such as "15" to "1.5" it won't work.
        </li>
        <li>
          This is because there is always a decimal at the end if not specified. Future versions of this form will make
          this behaviour less clunky however it is important to note how this works for the time being.
        </li>
      </ul>
    ),
    subject: NewsSubject.BugFix,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Heading Indicator',
    date: new Date('May 14, 2024'),
    content: (
      <ul>
        <li>
          The blue "Find Me"/"Current Location Indicator" dot now includes an arrow that points in the direction you are
          moving.
        </li>
        <li>
          This is a new and still somewhat experimental feature, however we feel it is useful enough now in its current
          version to justify releasing.
        </li>
        <li>Note that this is not functional on desktop, and works best when outside, moving, and not on WIFI.</li>
        <li>
          Some devices may have the old blue dot image cached, and will need their browser cache cleared to see the new
          image.
        </li>
      </ul>
    ),
    subject: NewsSubject.Update,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Improvements to sorting and filtering',
    date: new Date('May 7, 2024'),
    content: [
      <ul>
        <li>You can now choose AND or OR for most filters (spatial searches are limited to AND for now).</li>
        <li>You can now click column headers on the main records page to sort by that column.</li>
        <li>
          Click again to change direction, and once more to stop sorting. Note that for certain filter combinations, it
          is possible that sorting could slow things down.
        </li>
        <li>
          TIP: If you find yourself waiting a long time, try adding more filters to narrow down your results and then
          re-enable sorting.
        </li>
      </ul>
    ],
    subject: NewsSubject.Update,
    platform: NewsPlatform.BOTH
  },
  {
    title: 'Launch of the News Page',
    date: new Date('May 7, 2024'),
    content: (
      <p>
        This page was created to keep you informed of the latest changes and improvements to InvasivesBC. Check back
        often for updates! We will do our best to keep you in the loop.
      </p>
    ),
    subject: NewsSubject.New,
    platform: NewsPlatform.BOTH
  }
]
  .filter((article) => {
    if (buildTimeConfig) {
      return [NewsPlatform.MOBILE, NewsPlatform.BOTH].includes(article.platform);
    }
    return [NewsPlatform.WEB, NewsPlatform.BOTH].includes(article.platform);
  })
  .sort((a: NewsArticle, b: NewsArticle) => (a.date < b.date ? 1 : -1));

export default newsItems;
