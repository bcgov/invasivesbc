import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, Tooltip, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import HelpIcon from '@mui/icons-material/Help';
import { ClassNameMap } from '@mui/styles';
import React from 'react';
import TripStepStatus, { TripStatusCode } from './TripStepStatus';

interface ITripStep {
  expanded: boolean;
  title: string;
  helpText: string;
  classes?: ClassNameMap;
  additionalText: string;
  tripStepDetailsClassName: string;
  stepStatus: TripStatusCode;
  stepAccordionOnChange?: (event, expanded) => void;
  doneButtonCallBack?: () => void;
}

export const TripStep: React.FC<ITripStep> = (props) => {
  return (
    <Accordion defaultExpanded={props.expanded} expanded={props.expanded} onChange={props.stepAccordionOnChange}>
      <AccordionSummary
        className={props.classes.accordionSummary}
        expandIcon={<ExpandMore fontSize="large" />}
        aria-controls="panel-geo-record-picker-content"
        id="panel-geo-record-picker-header">
        <Grid alignContent="flex-start" justifyContent="space-between" container>
          <Grid xs={2} className={props.classes.tripAccordionGridItem} item>
            <Tooltip color="primary" title={props.helpText} arrow>
              <HelpIcon fontSize="large" />
            </Tooltip>
          </Grid>
          <Grid xs={6} item>
            <Typography align="left" variant="h5">
              {props.title}
            </Typography>
          </Grid>
          <Grid xs={2} item>
            <TripStepStatus statusCode={props.stepStatus} />
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={props.tripStepDetailsClassName}>
        {props.children}
        <Box m={2} alignSelf="center">
          <Button variant="contained" color="primary" onClick={props.doneButtonCallBack}>
            I'm done here.
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
