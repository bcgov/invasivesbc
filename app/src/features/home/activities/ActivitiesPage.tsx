import { Box, Button, Container, FormControl, Grid, InputLabel } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import ActivitiesList2 from '../../../components/activities-list/ActivitiesList2';

interface IStatusPageProps {
  classes?: any;
}

const useStyles = makeStyles((theme: any) => ({
  newActivityButtonsRow: {
    '& Button': {
      marginRight: '0.5rem',
      marginBottom: '0.5rem'
    }
  },
  syncSuccessful: {
    color: theme.palette.success.main
  },
  formControl: {}
}));

const ActivitiesPage: React.FC<IStatusPageProps> = (props) => {
  const classes = useStyles();
  return (
    <Container maxWidth={false} style={{ maxHeight: '100%' }} className={props.classes.container}>
      {/* <ActivitiesList /> */}
      <Grid container xs={12} height="50px" display="flex" justifyContent="left">
        <Grid sx={{ pb: 15 }} xs={12} item>
          <Button variant="contained">View/Edit Selected Form</Button>
          <Button variant="contained">Snap map to this record</Button>
          <Button variant="contained">Snap map to this table</Button>
        </Grid>
        <ActivitiesList2 />
        <ActivitiesList2 />
      </Grid>
    </Container>
  );
};

export default ActivitiesPage;
