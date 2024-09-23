import React, { useContext, useRef } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Typography, AccordionDetails, Box, Button } from '@mui/material';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import Herbicide from '../single-objects/Herbicide';
import AddIcon from '@mui/icons-material/Add';
import { RENDER_DEBUG } from 'UI/App';
//import { useFormStyles } from '../../formStyles';

const HerbicidesAccordion = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%HerbicidesAccordion:' + ref.current.toString(), 'color: yellow');
  }
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  //  const classes = useFormStyles();
  const tankMixOn = formDetails.form_data.tank_mix;

  return (
    <div id="herbicides_section">
      <Typography variant="h5">Herbicides</Typography>
      <div
        id="herbicides_list"
        // className={classes.listContainer}
      >
        {props.insideTankMix
          ? formDetails.form_data?.tank_mix_object?.herbicides?.map((herbicide, index) => (
              <Herbicide
                insideTankMix={props.insideTankMix}
                //          classes={classes}
                key={index}
                index={index}
                herbicide={herbicide}
              />
            ))
          : formDetails?.form_data?.herbicides?.map((herbicide, index) => (
              <Herbicide
                insideTankMix={props.insideTankMix}
                //         classes={classes}
                key={index}
                index={index}
                herbicide={herbicide}
              />
            ))}
      </div>

      <Box
      // className={classes.accordionBody}
      >
        <Box
          component="div"
          //className={classes.centerBox}
        >
          <Button
            disabled={formDetails.disabled}
            id="btn_add_herbicide"
            onClick={() => {
              if (props.insideTankMix) {
                setFormDetails((prevDetails) => {
                  const newHerbicidesArr = [...prevDetails.form_data.tank_mix_object.herbicides];
                  newHerbicidesArr.push({ index: newHerbicidesArr.length });
                  return {
                    ...prevDetails,
                    form_data: {
                      ...prevDetails.form_data,
                      skipAppRateValidation: false,
                      tank_mix_object: {
                        ...prevDetails.form_data.tank_mix_object,
                        herbicides: newHerbicidesArr
                      }
                    }
                  };
                });
              } else {
                setFormDetails((prevDetails) => {
                  const newHerbicidesArr = [...prevDetails.form_data.herbicides];
                  newHerbicidesArr.push({ index: newHerbicidesArr.length });
                  return {
                    ...prevDetails,
                    form_data: {
                      ...prevDetails.form_data,
                      skipAppRateValidation: false,
                      herbicides: newHerbicidesArr
                    }
                  };
                });
              }
            }}
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
          >
            Add Herbicide
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default HerbicidesAccordion;
