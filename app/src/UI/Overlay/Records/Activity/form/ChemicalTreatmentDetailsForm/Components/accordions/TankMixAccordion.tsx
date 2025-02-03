import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { useContext, useRef } from 'react';
import TankMix from '../single-objects/TankMix';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import { RENDER_DEBUG } from 'UI/App';

const TankMixAccordion = () => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%c TankMixAccordion render:' + ref.current.toString(), 'color: yellow');
  }
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const tankMixOn = formDataContext?.formDetails?.form_data?.tank_mix;

  return (
    <Accordion expanded={tankMixOn} disabled={!tankMixOn}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="tank-mix-content" id="tank-mix-header">
        <Typography variant="h5">Tank Mix</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TankMix />
      </AccordionDetails>
    </Accordion>
  );
};

export default TankMixAccordion;
