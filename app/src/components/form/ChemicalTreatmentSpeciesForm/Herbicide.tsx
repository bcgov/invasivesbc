import { Typography, Box, Button } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect, useState } from 'react';
import { IHerbicide } from './Models';
import CustomAutoComplete from './CustomAutoComplete';

export interface IHerbicideComponent {
  herbicide: any;
  index: number;
  businessCodes: any;
  chemicalApplicationMethodType: string;
  classes: any;
  herbicidesArrState: {
    herbicidesArr: IHerbicide[];
    setHerbicidesArr: React.Dispatch<React.SetStateAction<IHerbicide[]>>;
  };
}

const Herbicide: React.FC<IHerbicideComponent> = ({
  herbicide,
  index,
  classes,
  businessCodes,
  herbicidesArrState,
  chemicalApplicationMethodType
}) => {
  const [currentHerbicide, setCurrentHerbicide] = useState<IHerbicide>(herbicide);

  const [herbicideTypeChoices, setHerbicideTypeChoices] = useState<any[]>([]);
  const [herbicideChoices, setHerbicideChoices] = useState<any[]>([]);
  const [calculationTypeChoices, setCalculationTypeChoices] = useState<any[]>([]);

  //creating valueLabels to to get the lable for heading
  let optionValueLabels = {};
  const herbicide_type_code = herbicide.herbicide_type === 'G' ? 'granular_herbicide_code' : 'liquid_herbicide_code';
  Object.values(businessCodes[herbicide_type_code] as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

  //update this herbicide inside main herbicides array when current herbicide changes
  useEffect(() => {
    if (currentHerbicide === herbicide) {
      return;
    }
    herbicidesArrState.setHerbicidesArr((prevHerbicidesArr) => {
      const newHerbicidesArr = [...prevHerbicidesArr];
      newHerbicidesArr[index] = { ...currentHerbicide };
      return newHerbicidesArr;
    });
  }, [currentHerbicide]);

  //update choices for autocomplete fields
  useEffect(() => {
    switch (herbicide.herbicide_type) {
      case 'G': {
        setHerbicideChoices(businessCodes.granular_herbicide_code);
        break;
      }
      case 'L': {
        setHerbicideChoices(businessCodes.liquid_herbicide_code);
        break;
      }
      default:
        setHerbicideChoices([]);
        break;
    }
    switch (chemicalApplicationMethodType) {
      case 'spray':
        setHerbicideTypeChoices(businessCodes['herbicide_type_code']);
        setCalculationTypeChoices(businessCodes['calculation_type_code']);
        break;
      case 'direct':
        setHerbicideTypeChoices(
          businessCodes['herbicide_type_code'].filter((herb) => {
            return herb.value === 'G';
          })
        );
        setCalculationTypeChoices(
          businessCodes['calculation_type_code'].filter((herb) => {
            return herb.value === 'D';
          })
        );
        break;
      default:
        setHerbicideTypeChoices([]);
        setCalculationTypeChoices([]);
        break;
    }
  }, [herbicide, chemicalApplicationMethodType]);

  return (
    <Box component="span" className={classes.listItemContainer}>
      <Typography className={classes.speciesHeading} variant="h5">
        {optionValueLabels[herbicide.herbicide] ? optionValueLabels[herbicide.herbicide] : `Herbicide #${index + 1}`}
      </Typography>

      <CustomAutoComplete
        choices={herbicideTypeChoices}
        className={'inputField'}
        classes={classes}
        id={'herbicide-type'}
        label={'Herbicide Type'}
        parentState={{ herbicide, setCurrentHerbicide }}
        parentName={'herbicide'}
        fieldName={'herbicide_type'}
        onChange={(event, value) => {
          if (value === null) {
            return;
          }
          setCurrentHerbicide((prevHerbicide) => {
            return { ...prevHerbicide, herbicide_type: (value as any).value };
          });
        }}
      />

      <CustomAutoComplete
        choices={herbicideChoices}
        className={'inputField'}
        classes={classes}
        id={'herbicide'}
        label={'Herbicide'}
        parentState={{ herbicide, setCurrentHerbicide }}
        parentName={'herbicide'}
        fieldName={'herbicide'}
        onChange={(event, value) => {
          if (value === null) {
            return;
          }
          setCurrentHerbicide((prevHerbicide) => {
            return { ...prevHerbicide, herbicide: (value as any).value };
          });
        }}
      />

      <CustomAutoComplete
        choices={calculationTypeChoices}
        className={'inputField'}
        classes={classes}
        id={'calculation_type'}
        label={'Calculation Type'}
        parentState={{ herbicide, setCurrentHerbicide }}
        parentName={'herbicide'}
        fieldName={'calculation_type'}
        onChange={(event, value) => {
          if (value === null) {
            return;
          }
          setCurrentHerbicide((prevHerbicide) => {
            return { ...prevHerbicide, calculation_type: (value as any).value };
          });
        }}
      />

      <Button
        onClick={() => {
          herbicidesArrState.setHerbicidesArr((prevArr) => {
            const newHerbicidesArr = [...prevArr];
            newHerbicidesArr.splice(index, 1);
            return newHerbicidesArr;
          });
        }}
        variant="contained"
        className={classes.speciesRemoveButton}
        startIcon={<DeleteIcon />}
        color="secondary">
        Remove Herbicide
      </Button>
    </Box>
  );
};

export default Herbicide;
