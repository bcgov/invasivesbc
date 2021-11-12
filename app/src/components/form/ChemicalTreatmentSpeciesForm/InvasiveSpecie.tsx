import { Typography, Box, FormControl, TextField, Button } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect, useState } from 'react';
import { ISpecies } from './Models';
import CustomAutoComplete from './CustomAutoComplete';

export interface ISpeciesComponent {
  species: any;
  index: number;
  businessCodes: any;
  classes: any;
  speciesArrState: {
    speciesArr: ISpecies[];
    setSpeciesArr: React.Dispatch<React.SetStateAction<ISpecies[]>>;
  };
}

const InvasiveSpecies: React.FC<ISpeciesComponent> = ({ species, index, classes, businessCodes, speciesArrState }) => {
  const [currentSpecies, setCurrentSpecies] = useState<ISpecies>(species);

  //creating valueLabels to to get the lable for heading
  let optionValueLabels = {};
  Object.values(businessCodes['invasive_plant_code'] as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

  //update this specie inside main species array when current specie changes
  useEffect(() => {
    if (currentSpecies === species) {
      return;
    }
    speciesArrState.setSpeciesArr((prevSpeciessArr) => {
      const newSpeciessArr = [...prevSpeciessArr];
      newSpeciessArr[index] = { ...currentSpecies };
      return newSpeciessArr;
    });
  }, [currentSpecies]);

  return (
    <Box component="span" className={classes.listItemContainer}>
      <Typography className={classes.speciesHeading} variant="h5">
        {optionValueLabels[species.invasive_plant_code]
          ? `${optionValueLabels[species.invasive_plant_code]}`
          : `Species #${index + 1}`}
      </Typography>

      <CustomAutoComplete
        choices={businessCodes['invasive_plant_code']}
        className={'inputField'}
        classes={classes}
        fieldName={'invasive_plant_code'}
        id={'invasive_plant_code'}
        label={'Invasive Plant'}
        onChange={(event, value) => {
          if (value === null) {
            return;
          }
          setCurrentSpecies((prevSpecies) => {
            return { ...prevSpecies, invasive_plant_code: (value as any).value };
          });
        }}
        parentState={{ species, setCurrentSpecies }}
        parentName={'species'}
      />

      <TextField
        className={classes.inputField}
        style={{ display: speciesArrState.speciesArr.length < 2 ? 'none' : 'block' }}
        type="number"
        label="Percent of Treatment"
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentSpecies((prevSpecies) => {
            return { ...prevSpecies, percent_area_covered: Number(event.target.value) };
          });
        }}
        disabled={speciesArrState.speciesArr.length < 2}
        defaultValue={undefined}
      />

      <Button
        onClick={() => {
          speciesArrState.setSpeciesArr((prevArr) => {
            const newSpeciessArr = [...prevArr];
            newSpeciessArr.splice(index, 1);
            return newSpeciessArr;
          });
        }}
        variant="contained"
        className={classes.speciesRemoveButton}
        startIcon={<DeleteIcon />}
        color="secondary">
        Remove Species
      </Button>
    </Box>
  );
};

export default InvasiveSpecies;
