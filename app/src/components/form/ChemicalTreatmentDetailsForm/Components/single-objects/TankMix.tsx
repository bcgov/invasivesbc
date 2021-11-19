import { TextField } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import CustomAutoComplete from '../../CustomAutoComplete';
import HerbicidesAccordion from '../accordions/HerbicidesAccordion';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';

const TankMix: React.FC = (props) => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  const classes = formDetails.classes;
  const businessCodes = formDetails.businessCodes;

  const [currentTankMix, setCurrentTankMix] = useState(formDetails.formData.tank_mix_object);

  //when tank mix object changes, update it in context
  useEffect(() => {
    setFormDetails((prevDetails) => ({
      ...prevDetails,
      formData: { ...prevDetails.formData, tankMix: { ...currentTankMix } }
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

      <HerbicidesAccordion />

      <TextField
        className={classes.inputField}
        type="number"
        label="Amount of Mix Used"
        value={currentTankMix.calculation_fields?.amount_of_mix || ''}
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
        value={currentTankMix.calculation_fields?.delivery_rate_of_mix || ''}
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
        value={currentTankMix.calculation_fields?.area_treated_sqm || ''}
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
