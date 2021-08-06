import { DocType } from 'constants/database';
import { upsert, UpsertType } from 'contexts/DatabaseContext2';
import { notifyError, notifySuccess } from 'utils/NotificationUtils';

export const confirmDeleteTrip = (trip_ID, tripName) => {
  // prettier-ignore
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
    await upsert(
      [{ type: UpsertType.RAW_SQL, docType: DocType.TRIP, sql: `DELETE * FROM trip WHERE trip.id = ${trip_ID}` }],
      databaseContext
    );
    console.log('trip:' + trip_ID + ' has been deleted!');

    // let docs = await databaseContext.database.find({
    //   selector: {
    //     $and: [
    //       {
    //         docType: {
    //           $in: [DocType.REFERENCE_ACTIVITY, DocType.POINT_OF_INTEREST, DocType.REFERENCE_POINT_OF_INTEREST]
    //         }
    //       },
    //       { trip_IDs: { $elemMatch: { $eq: trip_ID.toString() } } }
    //     ]
    //   },
    //   use_index: 'tripIDIndex'
    // });
    // console.log(docs.docs);

    // let docsToDelete = [];
    // let docsToUpdate = [];

    // // sort into docs that have other trips and those we can delete
    // docs.docs.map((doc) => {
    //   let isDocToDelete = true;
    //   doc.trip_IDs.map((id) => {
    //     if (id !== trip_ID.toString()) {
    //       isDocToDelete = false;
    //     }
    //   });
    //   if (isDocToDelete) {
    //     docsToDelete.push({ ...doc, _deleted: true });
    //   } else {
    //     docsToUpdate.push(doc);
    //   }
    // });

    // //bulk delete
    // databaseContext.database.bulkDocs(docsToDelete);

    // //wipe trip id off overlapping records
    // docsToUpdate.map((doc) => {
    //   let newTripIDs = [];
    //   doc.trip_IDs.map((id) => {
    //     if (id !== trip_ID.toString()) {
    //       newTripIDs.push(id.toString());
    //     }
    //   });
    //   databaseContext.database.upsert(doc._id, (existingDoc) => {
    //     return {
    //       ...existingDoc,
    //       trip_IDs: [...newTripIDs]
    //     };
    //   });
    // });

    // notifySuccess(
    //   databaseContext,
    //   'Wiped ' +
    //     docsToDelete.length +
    //     ' records from trip.  ' +
    //     docsToUpdate.length +
    //     ' were not removed because they belong to another trip'
    // );
    // sort into records to update and those to delete
    // update records
    // delete records
  } catch (error) {
    notifyError(databaseContext, 'Ran into a problem deleting trip records:' + error);
    console.dir(error);
  }
};
