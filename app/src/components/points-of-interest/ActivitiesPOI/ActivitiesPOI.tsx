import { Accordion, AccordionDetails, AccordionSummary, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ExpandMore } from '@mui/icons-material';
import FormContainer from 'components/form/FormContainer';
import PhotoContainer from 'components/photo/PhotoContainer';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular
  }
}));

export interface ActivityPOIPropType {
  containerProps: any;
}

export const ActivitiesPOI: React.FC<ActivityPOIPropType> = (props) => {
  const classes = useStyles();

  const { containerProps } = props;

  return (
    <>
      <Typography align="center" className={classes.heading}>
        {containerProps.activity.activityType}: {containerProps.activity.activityId}
      </Typography>
      <br />
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
          <Typography className={classes.heading}>Form</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormContainer {...containerProps} />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
          <Typography className={classes.heading}>Photos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PhotoContainer {...containerProps} />
        </AccordionDetails>
      </Accordion>
    </>
  );
};
