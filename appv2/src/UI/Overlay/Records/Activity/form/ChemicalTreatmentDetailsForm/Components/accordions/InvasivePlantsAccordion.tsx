import React, { useContext, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Typography, AccordionDetails, Box, Button } from '@mui/material';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import AddIcon from '@mui/icons-material/Add';
import InvasivePlant from '../single-objects/InvasivePlant';
//import { useFormStyles } from '../../formStyles';


import '../../../../Form.css'

const InvasivePlantsAccordion = () => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  //const classes = useFormStyles();

  return (
    <div id="invasive_plants_section">
        <Typography
          style={{ width: '33%', flexShrink: 0 }}
          // color={invasivePlantsArrErrors?.length > 0 ? 'error' : 'textPrimary'}
          variant="h5">
          Invasive Plants
        </Typography>

            <div id="invasive_plants_list">
            {formDetails.form_data?.invasive_plants?.map((species, index) => {
              return <InvasivePlant species={species} key={index} index={index} 
             // classes={classes} 
              />;
            })}</div>

            <Button
              id="btn_add_invasive_plant"
              disabled={formDetails.disabled}
              onClick={() => {
                setFormDetails((prevDetails) => {
                  const newSpeciesArr = prevDetails?.form_data?.invasive_plants
                    ? [...prevDetails?.form_data?.invasive_plants]
                    : [];
                  newSpeciesArr.push({ invasive_plant_code: null, index: newSpeciesArr.length });
                  return {
                    ...prevDetails,
                    form_data: {
                      ...prevDetails.form_data,
                      invasive_plants: newSpeciesArr
                    }
                  };
                });
              }}
              variant="contained"
              startIcon={<AddIcon />}
              color="primary">
              Add Invasive Plant
            </Button>
    </div>
  );
};

export default InvasivePlantsAccordion;
