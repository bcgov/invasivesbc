import { Divider, Grid, Typography } from '@mui/material';
import { MediumDateFormat } from 'constants/misc';
import moment from 'moment';
import React from 'react';

interface IActivityListDate {
  classes: any;
  activity: any;
}

const ActivityListDate: React.FC<IActivityListDate> = (props) => {
  const { activity, classes } = props;

  return (
    <>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Created</Typography>
        {moment(activity.dateCreated).format(MediumDateFormat)}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Last Updated</Typography>
        {(activity.dateUpdated && moment(activity.dateUpdated).format(MediumDateFormat)) || 'n/a'}
      </Grid>
    </>
  );
};

export default ActivityListDate;
