import { Typography, Box, TextField, Button } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useContext, useEffect, useState } from 'react';
import { IInvasivePlant } from '../../Models';
import CustomAutoComplete from '../../CustomAutoComplete';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';

export interface IInvasivePlantComponent {
  index: number;
  species: any;
  key: number;
  classes: any;
}

const InvasivePlant: React.FC<IInvasivePlantComponent> = ({ index, key, species, classes }) => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  const businessCodes = formDetails.businessCodes;

  const invasivePlantsArr = formDetails.formData.invasive_plants;

  const [currentInvasivePlant, setCurrentInvasivePlant] = useState<IInvasivePlant>(
    formDetails.formData.invasive_plants[index]
  );

  //creating valueLabels to to get the lable for heading
  let optionValueLabels = {};
  Object.values(businessCodes['invasive_plant_code'] as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

  //update this invasive plant inside invasive plants arr
  useEffect(() => {
    if (currentInvasivePlant !== species) {
      setFormDetails((prevDetails) => {
        const newSpeciesArr = [...prevDetails.formData.invasive_plants];
        newSpeciesArr[index] = currentInvasivePlant;
        return {
          ...prevDetails,
          formData: {
            ...prevDetails.formData,
            invasive_plants: newSpeciesArr
          }
        };
      });
    }
  }, [currentInvasivePlant]);

  return (
    <Box component="span" className={classes.listItemContainer}>
      <Typography className={classes.speciesHeading} variant="h5">
        {optionValueLabels[species.invasive_plant_code]
          ? `${optionValueLabels[species.invasive_plant_code]}`
          : `InvasivePlant #${index + 1}`}
      </Typography>

      <CustomAutoComplete
        choices={businessCodes['invasive_plant_code']}
        className={'inputField'}
        classes={classes}
        actualValue={species.invasive_plant_code}
        fieldName={'invasive_plant_code'}
        id={'invasive_plant_code'}
        label={'Invasive Plant'}
        onChange={(event, value) => {
          if (value === null) {
            return;
          }
          setCurrentInvasivePlant((prevInvasivePlant) => {
            return { ...prevInvasivePlant, invasive_plant_code: (value as any).value };
          });
        }}
        parentName="species"
        parentState={{ species, setCurrentInvasivePlant }}
      />

      <TextField
        className={classes.inputField}
        style={{ display: invasivePlantsArr.length < 2 ? 'none' : 'block' }}
        type="number"
        value={species.percent_area_covered}
        label="Percent Area Covered"
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentInvasivePlant((prevInvasivePlant) => {
            return { ...prevInvasivePlant, percent_area_covered: Number(event.target.value) };
          });
        }}
        defaultValue={undefined}
      />

      <Button
        onClick={() => {
          setFormDetails((prevDetails) => {
            const newSpeciesArr = [...prevDetails.formData.invasive_plants];
            newSpeciesArr.splice(index, 1);
            return {
              ...prevDetails,
              formData: {
                ...prevDetails.formData,
                invasive_plants: newSpeciesArr
              }
            };
          });
        }}
        variant="contained"
        className={classes.speciesRemoveButton}
        startIcon={<DeleteIcon />}
        color="secondary">
        Remove Invasive Plant
      </Button>
    </Box>
  );
};

export default InvasivePlant;
