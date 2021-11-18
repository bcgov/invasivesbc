import { Box, Button, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CustomAutoComplete from './CustomAutoComplete';
import Herbicide from './Herbicide';
import { IHerbicide, ITankMix } from './Models';
import AddIcon from '@mui/icons-material/Add';

export interface ITankMixComponent {
  tankMixOn: boolean;
  businessCodes: any;
  chemicalApplicationMethodType: string;
  classes: any;
  errorSchema: any;
  tankMixState: {
    tankMix: ITankMix;
    setTankMix: React.Dispatch<React.SetStateAction<ITankMix>>;
  };
  herbicidesArrState: {
    herbicidesArr: IHerbicide[];
    setHerbicidesArr: React.Dispatch<React.SetStateAction<IHerbicide[]>>;
  };
}

const TankMix: React.FC<ITankMixComponent> = ({
  tankMixOn,
  businessCodes,
  errorSchema,
  chemicalApplicationMethodType,
  classes,
  tankMixState,
  herbicidesArrState
}) => {
  const herbicidesArr = herbicidesArrState.herbicidesArr;
  const setHerbicidesArr = herbicidesArrState.setHerbicidesArr;
  const tankMix = tankMixState.tankMix;

  const [currentTankMix, setCurrentTankMix] = useState(tankMixState.tankMix);
  const [calculationTypeChoices, setCalculationTypeChoices] = useState<any[]>([]);

  //when current tank mix changes, update main tank mix object
  useEffect(() => {
    tankMixState.setTankMix({ ...currentTankMix });
  }, [currentTankMix]);

  //when herbicides arr changes, update it in tank mix
  useEffect(() => {
    setCurrentTankMix({ ...currentTankMix, herbicides: herbicidesArr });
  }, [herbicidesArr]);

  //update choices for autocomplete fields
  useEffect(() => {
    setCalculationTypeChoices(
      businessCodes['calculation_type_code'].filter((herb) => {
        return herb.value === 'PAR';
      })
    );
  }, []);

  return (
    <>
      <CustomAutoComplete
        choices={calculationTypeChoices}
        className={'inputField'}
        classes={classes}
        id={'calculation_type'}
        label={'Calculation Type'}
        parentState={{ tankMix, setCurrentTankMix }}
        parentName={'tankMix'}
        fieldName={'calculation_type'}
        onChange={(event, value) => {
          if (value === null) {
            return;
          }
          setCurrentTankMix((prevTankMix) => {
            return { ...prevTankMix, calculation_type: (value as any).value };
          });
        }}
      />

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
        {herbicidesArrState.herbicidesArr.map((herbicide, index) => (
          <Herbicide
            key={index}
            herbicide={herbicide}
            tankMixOn={tankMixOn}
            errorSchema={errorSchema}
            chemicalApplicationMethodType={chemicalApplicationMethodType}
            classes={classes}
            index={index}
            businessCodes={businessCodes}
            herbicidesArrState={{ herbicidesArr, setHerbicidesArr }}
          />
        ))}
      </Box>

      <TextField
        className={classes.inputField}
        type="number"
        label="Amount of Mix Used"
        value={tankMix.calculation_fields?.amount_of_mix || ''}
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentTankMix((prevFields) => ({
            ...prevFields,
            calculation_fields: { ...prevFields.calculation_fields, amount_of_mix: Number(event.target.value) }
          }));
        }}
        defaultValue={undefined}
      />

      <TextField
        className={classes.inputField}
        type="number"
        label="Delivery Rate of Mix"
        value={tankMix.calculation_fields?.delivery_rate_of_mix || ''}
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentTankMix((prevFields) => ({
            ...prevFields,
            calculation_fields: { ...prevFields.calculation_fields, delivery_rate_of_mix: Number(event.target.value) }
          }));
        }}
        defaultValue={undefined}
      />

      <TextField
        className={classes.inputField}
        type="number"
        label="Area Treated (sqm)"
        value={tankMix.calculation_fields?.area_treated_sqm || ''}
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentTankMix((prevFields) => ({
            ...prevFields,
            calculation_fields: { ...prevFields.calculation_fields, area_treated_sqm: Number(event.target.value) }
          }));
        }}
        defaultValue={undefined}
      />
    </>
  );
};

export default TankMix;
