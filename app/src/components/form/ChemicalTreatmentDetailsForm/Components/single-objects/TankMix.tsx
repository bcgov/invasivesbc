import { TextField, Tooltip } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import CustomAutoComplete from '../../CustomAutoComplete';
import HerbicidesAccordion from '../accordions/HerbicidesAccordion';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import { useFormStyles } from '../../formStyles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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

  const [calculationTypeChoices, setCalculationTypeChoices] = useState<any[]>(
    businessCodes['calculation_type_code'].filter((herb) => {
      return herb.value === 'PAR';
    })
  );

  return (
    <>
      <Tooltip
        style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
        placement="left"
        title="Product application rate: the label recommended rate for treatment of this species that was used to mix the treatment solution. In litres per hectare. Dilution % : the label recommended percent solution used to treat this species that was used to mix the treatment solution.">
        <HelpOutlineIcon />
      </Tooltip>
      <CustomAutoComplete
        choices={calculationTypeChoices}
        className={'inputField'}
        classes={classes}
        id={'calculation_type'}
        key={'calculation_type'}
        label={'Calculation Type'}
        actualValue={formDetails.formData.tank_mix_object.calculation_type}
        parentState={{ currentTankMix, setCurrentTankMix }}
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

      <Tooltip
        style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
        placement="left"
        title="Volume in litres (ie 5.1 L) of herbicide and water mix">
        <HelpOutlineIcon />
      </Tooltip>
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

      <Tooltip
        style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
        placement="left"
        title="Calibrated delivery rate of the device used to apply herbicide in L/ha">
        <HelpOutlineIcon />
      </Tooltip>
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
    </>
  );
};

export default TankMix;
