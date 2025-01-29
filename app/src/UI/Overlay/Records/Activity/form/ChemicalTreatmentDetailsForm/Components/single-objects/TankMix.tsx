import { TextField, Tooltip } from '@mui/material';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import CustomAutoComplete from '../../CustomAutoComplete';
import HerbicidesAccordion from '../accordions/HerbicidesAccordion';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import isNumber from 'is-number';

const TankMix = () => {
  const form_dataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = form_dataContext;

  const [currentTankMix, setCurrentTankMix] = useState<Record<PropertyKey, any>>(formDetails.form_data.tank_mix_object);
  const [amountOfMixUsedKey, setAmountOfMixUsedKey] = useState<string>();
  const [deliveryRateOfMixKey, setDeliveryRateOfMixKey] = useState<string>();

  const businessCodes = formDetails.businessCodes;

  //when tank mix object changes, update it in context
  useEffect(() => {
    setFormDetails((prevDetails) => ({
      ...prevDetails,
      form_data: {
        ...prevDetails.form_data,
        tank_mix_object: {
          ...formDetails.form_data.tank_mix_object,
          delivery_rate_of_mix: currentTankMix?.delivery_rate_of_mix,
          amount_of_mix: currentTankMix?.amount_of_mix,
          calculation_type: currentTankMix?.calculation_type
        }
      }
    }));
  }, [currentTankMix]);

  const [calculationTypeChoices] = useState<Record<PropertyKey, any>[]>(
    businessCodes?.calculation_type_code.filter((herb) => herb.value === 'PAR')
  );

  return (
    <>
      <Tooltip
        style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
        placement="left"
        title="Product application rate: the label recommended rate for treatment of this species that was used to mix the treatment solution. In litres per hectare. Dilution % : the label recommended percent solution used to treat this species that was used to mix the treatment solution."
      >
        <HelpOutlineIcon />
      </Tooltip>
      <CustomAutoComplete
        disabled={formDetails.disabled}
        choices={calculationTypeChoices}
        className={'inputField'}
        id={'calculation_type'}
        key={'calculation_type'}
        label={'Calculation Type'}
        actualValue={formDetails.form_data?.tank_mix_object?.calculation_type}
        parentState={{ currentTankMix, setCurrentTankMix }}
        onChange={(_: ChangeEvent, value: Record<PropertyKey, any>) => {
          if (value === null) {
            return;
          }
          setCurrentTankMix((prevTankMix) => ({ ...prevTankMix, calculation_type: value.value }));
        }}
      />

      <HerbicidesAccordion insideTankMix={true} />

      <div id="tank_mix_delivery_and_amount">
        <div id="amount_of_mix_tank_mix">
          <Tooltip
            style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
            placement="left"
            title="Volume in litres (ie 5.1 L) of herbicide and water mix"
          >
            <HelpOutlineIcon />
          </Tooltip>
          <TextField
            disabled={formDetails.disabled}
            type="text"
            label="Amount of Mix Used (L)"
            value={currentTankMix?.amount_of_mix ?? ''}
            variant="outlined"
            key={amountOfMixUsedKey}
            onChange={(event) => {
              const input = event.target.value;
              if (input === '') {
                setCurrentTankMix((prevFields) => ({
                  ...prevFields,
                  amount_of_mix: undefined
                }));
              }
              if (!isNumber(input)) {
                setAmountOfMixUsedKey(Math.random().toString());
                return;
              }
              setCurrentTankMix((prevFields) => ({
                ...prevFields,
                amount_of_mix: Number(input)
              }));
            }}
            defaultValue={undefined}
          />
        </div>

        <div id="delivery_rate_of_mix_tank_mix">
          <Tooltip
            style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
            placement="left"
            title="Calibrated delivery rate of the device used to apply herbicide in L/ha"
          >
            <HelpOutlineIcon />
          </Tooltip>
          <TextField
            disabled={formDetails.disabled}
            type="text"
            label="Delivery Rate of Mix (L/ha)"
            value={currentTankMix?.delivery_rate_of_mix ?? ''}
            variant="outlined"
            key={deliveryRateOfMixKey}
            onChange={(event) => {
              const input = event.target.value;
              if (input === '') {
                setCurrentTankMix((prevFields: Record<PropertyKey, any>) => ({
                  ...prevFields,
                  delivery_rate_of_mix: Number(input)
                }));
              }
              if (!isNumber(input)) {
                setDeliveryRateOfMixKey(Math.random().toString());
                return;
              }
              setCurrentTankMix((prevFields) => ({
                ...prevFields,
                delivery_rate_of_mix: Number(input)
              }));
            }}
            defaultValue={undefined}
          />
        </div>
      </div>
    </>
  );
};

export default TankMix;
