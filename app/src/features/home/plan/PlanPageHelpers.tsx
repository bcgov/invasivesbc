import { DocType } from 'constants/database';
import { notifyError, notifySuccess } from 'utils/NotificationUtils';

export const confirmDeleteTrip = (trip_ID, tripName) => {
  if (confirm('You sure you want to do this?')) { // eslint-disable-line no-restricted-globals
    return true;
  }
  return false;
};

export const deleteTripRecords = async (databaseContext, trip_ID) => {
  try {
    // get ids and trip_id array of all records of certain doctypes (having trip_id array)

    if (!databaseContext) {
    }
    console.log('trip id to delete ' + trip_ID);
    let docs = await databaseContext.database.find({
      selector: {
        $and: [
          {
            docType: {
              $in: [DocType.REFERENCE_ACTIVITY, DocType.POINT_OF_INTEREST, DocType.REFERENCE_POINT_OF_INTEREST]
            }
          },
          { trip_IDs: { $elemMatch: { $eq: trip_ID.toString() } } }
        ]
      },
      use_index: 'tripIDIndex'
    });
    console.log(docs.docs);

    const docsToDelete = []
    const docsToUpdate = []

    notifySuccess(databaseContext, 'Wiped ' + docs.docs.length + ' records from trip');
    // sort into records to update and those to delete
    // update records
    // delete records
  } catch (error) {
    notifyError(databaseContext, 'Ran into a problem deleting trip records:' + error);
    console.dir(error);
  }
};
