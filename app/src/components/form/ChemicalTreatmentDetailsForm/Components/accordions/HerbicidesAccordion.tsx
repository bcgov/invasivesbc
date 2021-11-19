import React, { useContext, useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Typography, AccordionDetails, Box, Button } from '@material-ui/core';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import Herbicide from '../single-objects/Herbicide';
import AddIcon from '@mui/icons-material/Add';

const HerbicidesAccordion = () => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  const classes = formDetails.classes;
  const tankMixOn = formDetails.formData.tank_mix;

  const [herbicidesArr, setHerbicidesArr] = useState(formDetails.formData.herbicides);

  useEffect(() => {
    setFormDetails((prevDetails) => ({
      ...prevDetails,
      formData: { ...prevDetails.formData, herbicides: [...herbicidesArr] }
    }));
  }, [herbicidesArr]);

  return (
    <Accordion expanded={!tankMixOn} disabled={tankMixOn}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="herbicides-content" id="herbicides-header">
        <Typography variant="h5">Herbicides</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box className={classes.accordionBody}>
          <Box component="div" className={classes.centerBox}>
            <Button
              onClick={() => {
                setHerbicidesArr((prevArr) => {
                  const newHerbicidesArr = [...prevArr];
                  newHerbicidesArr.push({});
                  return newHerbicidesArr;
                });
              }}
              variant="contained"
              startIcon={<AddIcon />}
              color="primary">
              Add Herbicide
            </Button>
          </Box>

          <Box component="div" className={classes.listContainer}>
            {herbicidesArr.map((herbicide, index) => (
              <Herbicide key={index} herbicide={herbicide} />
            ))}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default HerbicidesAccordion;
