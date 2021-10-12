import ActivitesTables from './record-tables/ActivityTables';
import PointsOfInterestTables from './record-tables/PointOfInterestTables';
import MyRecordsTables from './record-tables/MyRecordsTables';

/* RecordTables
This is just a big list of table implementations for different contexts.
We try to keep the base RecordTable class general without Invasives-specific code in it as much as possible,
and put it in here instead, geared for each Activity/POI.
These could probably be reduced further to just JSON definitions but due to all the hooks and function definitions needed
we keep the boilerplate classes for now.

Other eccentricities:
- activityStandardMapping etc: these flatten some of the more complex or deeply-embedded data fields to accessible base-layer ones,
as well as convert them to more easily printable displays.  Future versions might make these into templates, or use paths as keys instead
to access deeper fields e.g. "activity_payload.form_data.activity_data.latitude" so we dont have to flatten here
- defaultActivitiesFetch: this just provides a default pagination-supporting DB fetch function so we're not loading an entire 10K+ row
table into memory at once.  Any table can override this if it needs more control over what it's fetching, but in general - if you can, just
improve this one
- ActivitiesTable: this is the base for a lot of tables, and it implements many default actions, headers, and behaviors.  In general if
any action might see reuse in multiple tables, just put it here and set it to `enabled = false` by default, turning it on for each applicable table
- MyActivitiesTable etc: these are tables designed for the "My Records" page which only show records of the current user

NOTE: these are designed to provide default data which can always be overridden by fresh props when instantiated throughout the app.
If a new field or table doesn't seem to be responding, look in here to make sure that property is preserved.
*/

export default {
  ...ActivitesTables,
  ...MyRecordsTables,
  ...PointsOfInterestTables
};
