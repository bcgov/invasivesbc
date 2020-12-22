import { Box, Divider, Grid, Typography } from '@material-ui/core';
import React from 'react';

interface IActivityListItem {
  activity: any;
  classes: any;
}

const ActivityListItem: React.FC<IActivityListItem> = (props) => {
  const { activity, classes } = props;

  return (
    <>
      <Grid item md={3}>
        <Box overflow="hidden" textOverflow="ellipsis" title={activity.activityType}>
          <Typography className={classes.activitiyListItem_Typography}>Type</Typography>
          {activity.activityType}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={3}>
        <Box overflow="hidden" textOverflow="ellipsis" title={activity.activitySubtype.split('_')[2]}>
          <Typography className={classes.activitiyListItem_Typography}>Subtype</Typography>
          {activity.activitySubtype.split('_')[2]}
        </Box>
      </Grid>
    </>
  );
};

export default ActivityListItem;
