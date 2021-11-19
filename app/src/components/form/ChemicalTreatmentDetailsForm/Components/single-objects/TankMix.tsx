import { TextField } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import CustomAutoComplete from '../../CustomAutoComplete';
import HerbicidesAccordion from '../accordions/HerbicidesAccordion';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import { useFormStyles } from '../../formStyles';

const TankMix: React.FC = (props) => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  const classes = useFormStyles();
  const businessCodes = formDetails.businessCodes;

  const [currentTankMix, setCurrentTankMix] = useState(formDetails.formData.tank_mix_object);

  //when tank mix object changes, update it in context
  useEffect(() => {
    setFormDetails((prevDetails) => ({
      ...prevDetails,
      formData: { ...prevDetails.formData, tank_mix_object: { ...currentTankMix } }
    }));
  }, [currentTankMix]);

  const [calculationTypeChoices, setCalculationTypeChoices] = useState<any[]>([]);

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
        parentState={{ currentTankMix, setCurrentTankMix }}
        parentName={'currentTankMix'}
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

      <HerbicidesAccordion insideTankMix={true} />

      <TextField
        className={classes.inputField}
        type="number"
        label="Amount of Mix Used"
        value={currentTankMix.amount_of_mix || ''}
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentTankMix((prevFields) => ({
            ...prevFields,
            amount_of_mix: Number(event.target.value)
          }));
        }}
        defaultValue={undefined}
      />

      <TextField
        className={classes.inputField}
        type="number"
        label="Delivery Rate of Mix"
        value={currentTankMix.delivery_rate_of_mix || ''}
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentTankMix((prevFields) => ({
            ...prevFields,
            delivery_rate_of_mix: Number(event.target.value)
          }));
        }}
        defaultValue={undefined}
      />

      <TextField
        className={classes.inputField}
        type="number"
        label="Area Treated (sqm)"
        value={currentTankMix.area_treated_sqm || ''}
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentTankMix((prevFields) => ({
            ...prevFields,
            area_treated_sqm: Number(event.target.value)
          }));
        }}
        defaultValue={undefined}
      />
    </>
  );
};

export default TankMix;
