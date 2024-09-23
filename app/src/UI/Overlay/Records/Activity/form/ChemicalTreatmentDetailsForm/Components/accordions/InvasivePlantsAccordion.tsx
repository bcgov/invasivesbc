import { useContext, useRef } from 'react';
import { Typography, Button } from '@mui/material';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import AddIcon from '@mui/icons-material/Add';
import InvasivePlant from '../single-objects/InvasivePlant';
import '../../../../Form.css';
import { RENDER_DEBUG } from 'UI/App';

const InvasivePlantsAccordion = () => {
  const ref = useRef(0);
  ref.current += 1;
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  return (
    <div id="invasive_plants_section">
      <Typography style={{ width: '33%', flexShrink: 0 }} variant="h5">
        Invasive Plants
      </Typography>

      <div id="invasive_plants_list">
        {formDetails.form_data?.invasive_plants?.map((species, index) => (
          <InvasivePlant species={species} key={index} index={index} />
        ))}
      </div>

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
        color="primary"
      >
        Add Invasive Plant
      </Button>
    </div>
  );
};

export default InvasivePlantsAccordion;
