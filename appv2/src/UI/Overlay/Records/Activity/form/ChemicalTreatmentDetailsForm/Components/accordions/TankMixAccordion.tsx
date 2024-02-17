import { Accordion, AccordionSummary, Typography, AccordionDetails, Box } from '@mui/material';
import React, { useContext } from 'react';
import TankMix from '../single-objects/TankMix';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
//import { useFormStyles } from '../../formStyles';

const TankMixAccordion = () => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails } = formDataContext;

  //const classes = useFormStyles();
  const tankMixOn = formDetails.form_data.tank_mix;
  return (
    <Accordion expanded={tankMixOn} disabled={!tankMixOn}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="tank-mix-content" id="tank-mix-header">
        <Typography
          // color={herbicidesArrErrors?.length > 0 ? 'error' : 'textPrimary'}
          style={{ width: '33%', flexShrink: 0 }}
          variant="h5">
          Tank Mix
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box 
      //  className={classes.accordionBody}
        >
          <TankMix />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default TankMixAccordion;
