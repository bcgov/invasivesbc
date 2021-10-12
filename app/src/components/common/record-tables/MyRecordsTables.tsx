import { ReviewStatus } from 'constants/activities';
import React from 'react';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import {
  activitesDefaultHeaders,
  IActivitiesTable,
  ActivitiesTable,
  AnimalActivitiesTable,
  ObservationsTable,
  TreatmentsTable,
  MonitoringTable,
  TransectsTable,
  BiocontrolTable
} from './ActivityTables';

const myRecordsTableDefaults = {
  startingOrderBy: 'created_timestamp',
  startingOrder: 'asc',
  review_status: [ReviewStatus.DISAPPROVED, ReviewStatus.PREAPPROVED, ReviewStatus.NOT_REVIEWED],
  headers: [
    {
      id: 'sync_status',
      title: 'Save Status'
    },
    'form_status',
    {
      id: 'review_status_rendered',
      title: 'Review Status'
    },
    ...activitesDefaultHeaders
  ]
};

export const MyActivitiesTable: React.FC<IActivitiesTable> = (props) => (
  <ActivitiesTable created_by={useKeycloakWrapper().preferred_username} {...myRecordsTableDefaults} {...props} />
);

export const MyAnimalActivitiesTable: React.FC<IActivitiesTable> = (props) => (
  <AnimalActivitiesTable created_by={useKeycloakWrapper().preferred_username} {...myRecordsTableDefaults} {...props} />
);

export const MyObservationsTable: React.FC<IActivitiesTable> = (props) => (
  <ObservationsTable created_by={useKeycloakWrapper().preferred_username} {...myRecordsTableDefaults} {...props} />
);

export const MyTreatmentsTable: React.FC<IActivitiesTable> = (props) => (
  <TreatmentsTable created_by={useKeycloakWrapper().preferred_username} {...myRecordsTableDefaults} {...props} />
);

export const MyMonitoringTable: React.FC<IActivitiesTable> = (props) => (
  <MonitoringTable created_by={useKeycloakWrapper().preferred_username} {...myRecordsTableDefaults} {...props} />
);

export const MyTransectsTable: React.FC<IActivitiesTable> = (props) => (
  <TransectsTable created_by={useKeycloakWrapper().preferred_username} {...myRecordsTableDefaults} {...props} />
);

export const MyBiocontrolTable: React.FC<IActivitiesTable> = (props) => (
  <BiocontrolTable created_by={useKeycloakWrapper().preferred_username} {...myRecordsTableDefaults} {...props} />
);

export const ReviewActivitiesTable: React.FC<IActivitiesTable> = (props) => (
  <ActivitiesTable
    tableName="Under Review"
    startingOrderBy="created_timestamp"
    startingOrder="asc"
    headers={myRecordsTableDefaults.headers}
    review_status={[ReviewStatus.UNDER_REVIEW]}
    {...props}
  />
);

export const MyPastActivitiesTable: React.FC<IActivitiesTable> = (props) => (
  <MyActivitiesTable
    tableName="My Old Activities"
    review_status={[ReviewStatus.APPROVED, ReviewStatus.PREAPPROVED]}
    {...props}
  />
);

export default {
  MyActivitiesTable,
  MyAnimalActivitiesTable,
  MyObservationsTable,
  MyTreatmentsTable,
  MyMonitoringTable,
  MyTransectsTable,
  MyBiocontrolTable,
  ReviewActivitiesTable,
  MyPastActivitiesTable
};
