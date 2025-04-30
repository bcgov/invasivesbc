import { useContext, useRef } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import Herbicide from '../single-objects/Herbicide';
import AddIcon from '@mui/icons-material/Add';
import { RENDER_DEBUG } from 'UI/App';
import { nanoid } from '@reduxjs/toolkit';

type PropTypes = {
  insideTankMix: boolean;
};
const HerbicidesAccordion = ({ insideTankMix }: PropTypes) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%HerbicidesAccordion:' + ref.current.toString(), 'color: yellow');
  }
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  return (
    <div id="herbicides_section">
      <Typography variant="h5">Herbicides</Typography>
      <div id="herbicides_list">
        {insideTankMix
          ? formDetails.form_data?.tank_mix_object?.herbicides?.map((herbicide) => (
              <Herbicide
                insideTankMix={insideTankMix}
                key={herbicide?.uuid ?? herbicide.index}
                index={herbicide.index}
                herbicide={herbicide}
              />
            ))
          : formDetails?.form_data?.herbicides?.map((herbicide) => (
              <Herbicide
                insideTankMix={insideTankMix}
                key={herbicide?.uuid ?? herbicide.index}
                index={herbicide.index}
                herbicide={herbicide}
              />
            ))}
      </div>
      <Box component="div">
        <Button
          disabled={formDetails.disabled}
          id="btn_add_herbicide"
          onClick={() => {
            /* Due to a metabase Report, we want to keep the Herbicides Array index in the Object.
               But to prevent unnecessary Rererendering, we add the uuid key */
            if (insideTankMix) {
              setFormDetails((prevDetails) => {
                const newHerbicidesArr = [...prevDetails.form_data.tank_mix_object.herbicides];
                newHerbicidesArr.push({ index: newHerbicidesArr.length, uuid: nanoid() });
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
                newHerbicidesArr.push({ index: newHerbicidesArr.length, uuid: nanoid() });
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
    </div>
  );
};

export default HerbicidesAccordion;
