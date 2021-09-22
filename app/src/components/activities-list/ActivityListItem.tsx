import { Box, Divider, Grid, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useInvasivesApi } from 'hooks/useInvasivesApi';

interface IActivityListItem {
  activity: any;
  classes: any;
}

const ActivityListItem: React.FC<IActivityListItem> = (props) => {
  const { activity, classes } = props;

  const invasivesApi = useInvasivesApi();
  const [species, setSpecies] = useState(null);

  useEffect(() => {
    getSpeciesFromActivity();
  }, []);

  /*
    Function to get the species for a given activity and set it in state
    for usage and display in the activities grid
  */
  const getSpeciesFromActivity = async () => {
    /*
      Temporarily only enabled for plant terrestrial observation subtype
    */
    if (activity.activitySubtype !== 'Activity_Observation_PlantTerrestrial') {
      return;
    }

    const speciesCode = activity.formData?.activity_subtype_data?.invasive_plant_code;

    if (speciesCode) {
      const codeResults = await invasivesApi.getSpeciesDetails([speciesCode]);

      setSpecies(codeResults?.[0]?.code_description);
    }
  };

  return (
    <>
      <Grid item md={2}>
        <Box overflow="hidden" textOverflow="ellipsis" title={activity.activityType}>
          <Typography className={classes.activitiyListItem_Typography}>Type</Typography>
          {activity.activityType}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Box overflow="hidden" textOverflow="ellipsis" title={activity.activitySubtype.split('_')[2]}>
          <Typography className={classes.activitiyListItem_Typography}>Subtype</Typography>
          {activity.activitySubtype.split('_')[2]}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={3}>
        <Box overflow="hidden" textOverflow="ellipsis" title={species}>
          {species && (
            <>
              <Typography className={classes.activitiyListItem_Typography}>Species</Typography>
              {species}
            </>
          )}
        </Box>
      </Grid>
    </>
  );
};

export default ActivityListItem;
