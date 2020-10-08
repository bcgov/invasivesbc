import { Container, Grid, makeStyles, Paper } from '@material-ui/core';
import ManageDatabaseContainer from 'components/database/ClearDatabase';
import MapContainer from 'components/map/MapContainer';
import React from 'react';

interface IPlanPageProps {
  classes?: any;
}


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  mapContainer: {
    height: '600px'
  },
  map: {
    height: '500px',
    width: '100%'
  }

}));


const PlanPage: React.FC<IPlanPageProps> = (props) => {
  const classes = useStyles();
  return (
    <Container className={props.classes.container}>
      <ManageDatabaseContainer />
      <Paper>
        <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>Zoe's wild trip</Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>xs=6</Paper>
        </Grid>
        <Grid item  xs={6}>
          <Paper className={classes.paper}><MapContainer {...props} classes={classes}  /></Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>xs=3</Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>xs=3</Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>xs=3</Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>xs=3</Paper>
        </Grid>
    </Grid></Paper>
    </Container>
  );
};

export default PlanPage;
