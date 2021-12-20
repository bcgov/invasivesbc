import React, { useContext, useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Typography, AccordionDetails, Box, Button } from '@material-ui/core';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import Herbicide from '../single-objects/Herbicide';
import AddIcon from '@mui/icons-material/Add';
import { useFormStyles } from '../../formStyles';

const HerbicidesAccordion = (props) => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  const classes = useFormStyles();
  const tankMixOn = formDetails.formData.tank_mix;

  return (
    <Accordion
      expanded={(tankMixOn && props.insideTankMix) || (!tankMixOn && !props.insideTankMix)}
      disabled={(tankMixOn && !props.insideTankMix) || (!tankMixOn && props.insideTankMix)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="herbicides-content" id="herbicides-header">
        <Typography variant="h5">Herbicides</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box className={classes.accordionBody}>
          <Box component="div" className={classes.centerBox}>
            <Button
              onClick={() => {
                if (props.insideTankMix) {
                  setFormDetails((prevDetails) => {
                    const newHerbicidesArr = [...prevDetails.formData.tank_mix_object.herbicides];
                    newHerbicidesArr.push({});
                    return {
                      ...prevDetails,
                      formData: {
                        ...prevDetails.formData,
                        tank_mix_object: {
                          ...prevDetails.formData.tank_mix_object,
                          herbicides: newHerbicidesArr
                        }
                      }
                    };
                  });
                } else {
                  setFormDetails((prevDetails) => {
                    const newHerbicidesArr = [...prevDetails.formData.herbicides];
                    newHerbicidesArr.push({});
                    return {
                      ...prevDetails,
                      formData: {
                        ...prevDetails.formData,
                        herbicides: newHerbicidesArr
                      }
                    };
                  });
                }
              }}
              variant="contained"
              startIcon={<AddIcon />}
              color="primary">
              Add Herbicide
            </Button>
          </Box>

          <Box component="div" className={classes.listContainer}>
            {props.insideTankMix
              ? formDetails.formData.tank_mix_object.herbicides.map((herbicide, index) => (
                  <Herbicide
                    insideTankMix={props.insideTankMix}
                    classes={classes}
                    key={index}
                    index={index}
                    herbicide={herbicide}
                  />
                ))
              : formDetails.formData.herbicides.map((herbicide, index) => (
                  <Herbicide
                    insideTankMix={props.insideTankMix}
                    classes={classes}
                    key={index}
                    index={index}
                    herbicide={herbicide}
                  />
                ))}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default HerbicidesAccordion;
