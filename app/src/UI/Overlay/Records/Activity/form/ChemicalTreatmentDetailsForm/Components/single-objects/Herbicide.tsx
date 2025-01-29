import { Typography, Button, TextField, Tooltip, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import CustomAutoComplete from '../../CustomAutoComplete';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import isNumber from 'is-number';
import { IHerbicide } from 'sharedAPI';

enum ApplicationMethod {
  Spray,
  Direct
}

type PropTypes = {
  herbicide: any;
  index: number;
  insideTankMix?: boolean;
};

const Herbicide = ({ herbicide, index, insideTankMix }: PropTypes) => {
  const form_dataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = form_dataContext;

  const [tankProductApplicationRateKey, setTankProductApplicationRateKey] = useState<string>();
  const [noTankProductApplicationRateKey, setNoTankProductApplicationRateKey] = useState<string>();
  const [noTankProductApplicationRateLHAKey, setNoTankProductApplicationRateLHAKey] = useState<string>();
  const [amountOfMixUsedKey, setAmountOfMixUsedKey] = useState<string>();
  const [deliveryRateOfMixKey, setDeliveryRateOfMixKey] = useState<string>();
  const [areaTreatedSqmKey, setAreaTreatedSqmKey] = useState<string>();
  const [dilutionPercentKey, setDilutionPercentKey] = useState<string>();

  const businessCodes = formDetails.businessCodes;
  const chemicalApplicationMethod = formDetails.form_data.chemical_application_method;
  const tankMixOn = formDetails.form_data.tank_mix;

  const [product_application_rate, setProduct_application_rate] = useState<number>();

  useEffect(() => {
    if (!product_application_rate || isNaN(product_application_rate)) {
      return;
    } else {
      if (herbicide.herbicide_type_code === 'G') {
        setCurrentHerbicide((prevFields) => ({
          ...prevFields,
          product_application_rate_calculated: Number(product_application_rate) / 1000,
          product_application_rate: product_application_rate
        }));
      }
      if (herbicide.herbicide_type_code === 'L') {
        setCurrentHerbicide((prevFields) => ({
          ...prevFields,
          product_application_rate_calculated: product_application_rate,
          product_application_rate: product_application_rate
        }));
      }
    }
  }, [product_application_rate, herbicide?.herbicide_type_code]);

  // get arrays for spray and direct chemical methods
  const chemical_method_direct_code_values = businessCodes.chemical_method_direct.map((code) => code.value);

  const chemicalApplicationMethodType = chemical_method_direct_code_values.includes(chemicalApplicationMethod)
    ? ApplicationMethod.Direct
    : ApplicationMethod.Spray;

  const [currentHerbicide, setCurrentHerbicide] = useState<IHerbicide>(
    insideTankMix ? formDetails.form_data.tank_mix_object.herbicides[index] : formDetails.form_data.herbicides[index]
  );

  const herbicideTypeChoices = (() => {
    if (chemicalApplicationMethodType === ApplicationMethod.Spray) {
      return businessCodes.herbicide_type_code;
    } else if (chemicalApplicationMethodType === ApplicationMethod.Direct) {
      return businessCodes.herbicide_type_code.filter((herb) => herb.value === 'L');
    }
    return [];
  })();

  const calculationTypeChoices = (() => {
    if (chemicalApplicationMethodType === ApplicationMethod.Spray) {
      return businessCodes.calculation_type_code;
    } else if (chemicalApplicationMethodType === ApplicationMethod.Direct) {
      return businessCodes.calculation_type_code.filter((calcType) => calcType.value === 'D');
    }
    return [];
  })();

  const [herbicideChoices, setHerbicideChoices] = useState<any[]>(
    (() => {
      if (herbicide.herbicide_type_code === 'G') {
        return businessCodes.granular_herbicide_code;
      } else if (herbicide.herbicide_type_code === 'L') {
        return businessCodes.liquid_herbicide_code;
      }
      return [];
    })()
  );

  // creating valueLabels to to get the lable for heading
  const optionValueLabels = {};
  const herbicide_type_code =
    herbicide.herbicide_type_code === 'G' ? 'granular_herbicide_code' : 'liquid_herbicide_code';
  Object.values(businessCodes[herbicide_type_code] as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

  // update herbicide choices for autocomplete field
  useEffect(() => {
    switch (herbicide.herbicide_type_code) {
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
  }, [herbicide]);

  // update this herbicide inside context
  useEffect(() => {
    if (currentHerbicide !== herbicide) {
      if (insideTankMix) {
        setFormDetails((prevDetails) => {
          const newHerbArr = [...formDetails.form_data.tank_mix_object.herbicides];
          newHerbArr[index] = currentHerbicide;
          return {
            ...prevDetails,
            form_data: {
              ...prevDetails.form_data,
              tank_mix_object: {
                ...prevDetails.form_data.tank_mix_object,
                herbicides: newHerbArr
              }
            }
          };
        });
      } else {
        setFormDetails((prevDetails) => {
          const newHerbArr = [...formDetails.form_data.herbicides];
          newHerbArr[index] = currentHerbicide;
          return {
            ...prevDetails,
            form_data: { ...prevDetails.form_data, herbicides: newHerbArr }
          };
        });
      }
    }
  }, [currentHerbicide]);

  return (
    <div className={'herbicide_list_item'}>
      <Typography variant="h5">
        {optionValueLabels[herbicide.herbicide_code]
          ? optionValueLabels[herbicide.herbicide_code]
          : `Herbicide #${index + 1}`}
      </Typography>
      <div className="input-field">
        <Tooltip
          style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
          placement="left"
          title="Choose whether the herbicide being used is liquid or granular"
        >
          <HelpOutlineIcon />
        </Tooltip>
        <CustomAutoComplete
          disabled={formDetails.disabled}
          choices={herbicideTypeChoices}
          className={'inputField'}
          id={'herbicide-type'}
          key={'herbicide-type'}
          actualValue={herbicide.herbicide_type_code}
          label={'Herbicide Type'}
          parentState={{ herbicide, setCurrentHerbicide }}
          onChange={(_: ChangeEvent, value) => {
            if (value === null) {
              return;
            }

            setCurrentHerbicide((prevHerbicide) => ({ ...prevHerbicide, herbicide_type_code: value.value }));
          }}
        />
      </div>
      <div className="input-field">
        <Tooltip
          placement="left"
          style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
          title="Choose which herbicide you are using"
        >
          <HelpOutlineIcon />
        </Tooltip>
        <CustomAutoComplete
          disabled={formDetails.disabled}
          choices={herbicideChoices}
          className={'inputField'}
          id={'herbicide-code'}
          label={'Herbicide'}
          actualValue={herbicide.herbicide_code}
          parentState={{ herbicide, setCurrentHerbicide }}
          onChange={(_: ChangeEvent, value) => {
            if (value === null) {
              return;
            }
            setCurrentHerbicide((prevHerbicide) => {
              return { ...prevHerbicide, herbicide_code: value.value };
            });
          }}
        />
      </div>
      {!tankMixOn && (
        <div className="input-field">
          <Tooltip
            style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
            placement="left"
            title="Product application rate: the label recommended rate for treatment of this species that was used to mix the treatment solution. In litres per hectare. Dilution % : the label recommended percent solution used to treat this species that was used to mix the treatment solution. Expressed as the percent of herbicide in the solution."
          >
            <HelpOutlineIcon />
          </Tooltip>
          <CustomAutoComplete
            disabled={formDetails.disabled}
            choices={calculationTypeChoices}
            className={'inputField'}
            id={'calculation_type'}
            label={'Calculation Type'}
            actualValue={herbicide.calculation_type}
            parentState={{ herbicide, setCurrentHerbicide }}
            onChange={(_: ChangeEvent, value) => {
              if (value === null) {
                return;
              }
              setCurrentHerbicide((prevHerbicide) => ({ ...prevHerbicide, calculation_type: value.value }));
            }}
          />
        </div>
      )}
      {tankMixOn && (
        <div className="productApplicationRate">
          <Tooltip
            style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
            placement="left"
            title="Recommended label rate for herbicide (L/ha) used for this treatment"
          >
            <HelpOutlineIcon />
          </Tooltip>
          <TextField
            disabled={formDetails.disabled}
            type="text"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            label={
              herbicide?.herbicide_type_code === 'G'
                ? 'Product Application Rate (g/ha)'
                : 'Product Application Rate (l/ha)'
            }
            value={herbicide?.product_application_rate?.toFixed(3)}
            variant="outlined"
            key={tankProductApplicationRateKey}
            onKeyDown={(event) => {
              if (event.code === 'Backspace') {
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  product_application_rate: undefined
                }));
              }
            }}
            onBlur={(event) => {
              const input = event.target.value;
              if (input === '') {
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  product_application_rate: undefined
                }));
              }
              if (!isNumber(input)) {
                setTankProductApplicationRateKey(Math.random().toString());
                return;
              }
              setCurrentHerbicide((prevFields) => ({
                ...prevFields,
                product_application_rate: Number(input)
              }));
            }}
            defaultValue={undefined}
          />
        </div>
      )}
      {!tankMixOn && (
        <div className="amountOfMix">
          <Tooltip
            style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
            placement="left"
            title="Volume in litres (ie 5.1 L) of herbicide and water mix"
          >
            <HelpOutlineIcon />
          </Tooltip>
          <TextField
            disabled={formDetails.disabled}
            id="amount-of-mix-used"
            type="text"
            label="Amount of Mix Used (L)"
            value={herbicide?.amount_of_mix?.toFixed(4)}
            variant="outlined"
            key={amountOfMixUsedKey}
            onKeyDown={(event) => {
              if (event.code === 'Backspace') {
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  amount_of_mix: undefined
                }));
              }
            }}
            onBlur={(event) => {
              const input = event.target.value;
              if (input === '') {
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  amount_of_mix: undefined
                }));
              }
              if (!isNumber(input)) {
                setAmountOfMixUsedKey(Math.random().toString());
                return;
              }
              setCurrentHerbicide((prevFields) => ({
                ...prevFields,
                amount_of_mix: Number(input)
              }));
            }}
            defaultValue={undefined}
          />
        </div>
      )}
      {!tankMixOn && currentHerbicide?.calculation_type === 'D' && (
        <>
          <div className="input-field">
            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Percent (%) of product in the mix"
            >
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              id="dilution"
              type="text"
              label="Dilution (%)"
              value={herbicide?.dilution}
              variant="outlined"
              key={dilutionPercentKey}
              onBlur={(event) => {
                const input = event.target.value;
                if (input === '') {
                  setCurrentHerbicide((prevFields) => ({
                    ...prevFields,
                    dilution: undefined
                  }));
                }
                if (!isNumber(input)) {
                  setDilutionPercentKey(Math.random().toString());
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  dilution: Number(Number(input).toFixed(4))
                }));
              }}
              defaultValue={undefined}
            />
          </div>
          <div className="input-field">
            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Area Treated in square meters"
            >
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              id="area-treated"
              type="text"
              label="Area Treated (sqm)"
              value={herbicide?.area_treated_sqm?.toFixed(2)}
              variant="outlined"
              key={areaTreatedSqmKey}
              onBlur={(event) => {
                const input = event.target.value;
                if (input === '') {
                  setCurrentHerbicide((prevFields) => ({
                    ...prevFields,
                    area_treated_sqm: undefined
                  }));
                }
                if (!isNumber(input)) {
                  setAreaTreatedSqmKey(Math.random().toString());
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  area_treated_sqm: Number(input)
                }));
              }}
              defaultValue={undefined}
            />
          </div>
        </>
      )}
      {!tankMixOn && currentHerbicide?.calculation_type === 'PAR' && (
        <>
          <div className="input-field">
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
              id="delivery-rate-of-mix"
              label="Delivery Rate of Mix (L/ha)"
              value={herbicide?.delivery_rate_of_mix?.toFixed(2)}
              variant="outlined"
              key={deliveryRateOfMixKey}
              onKeyDown={(event) => {
                if (event.code === 'Backspace') {
                  setCurrentHerbicide((prevFields) => ({
                    ...prevFields,
                    delivery_rate_of_mix: undefined
                  }));
                }
              }}
              onBlur={(event) => {
                const input = event.target.value;
                if (input === '') {
                  setCurrentHerbicide((prevFields) => ({
                    ...prevFields,
                    delivery_rate_of_mix: undefined
                  }));
                }
                if (!isNumber(input)) {
                  setDeliveryRateOfMixKey(Math.random().toString());
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  delivery_rate_of_mix: Number(input)
                }));
              }}
              defaultValue={undefined}
            />
          </div>
          <div className="input-field">
            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title={
                currentHerbicide?.herbicide_type_code === 'G'
                  ? 'Recommended label rate for herbicide (g/ha) used for this treatment'
                  : 'Recommended label rate for herbicide (L/ha) used for this treatment'
              }
            >
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              type="decimal"
              id="product-application-rate"
              label={
                currentHerbicide?.herbicide_type_code === 'G'
                  ? 'Product Application Rate (g/ha)'
                  : 'Product Application Rate (L/ha)'
              }
              value={herbicide.product_application_rate?.toFixed(3)}
              key={noTankProductApplicationRateKey}
              variant="outlined"
              onKeyDown={(event) => {
                if (event.code === 'Backspace') {
                  setProduct_application_rate(undefined);
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  product_application_rate: undefined
                }));
              }}
              onBlur={(event) => {
                const input = event.target.value;
                if (event.target.value === '') {
                  setProduct_application_rate(undefined);
                }
                if (!isNumber(event.target.value)) {
                  setNoTankProductApplicationRateKey(Math.random().toString());
                  return;
                }
                setProduct_application_rate(Number(input));
              }}
              defaultValue={undefined}
            />
          </div>
          {currentHerbicide?.herbicide_type_code === 'G' && (
            <div className="input-field">
              <Tooltip
                style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
                placement="left"
                title="Recommended label rate for herbicide (L/ha) used for this treatment"
              >
                <HelpOutlineIcon />
              </Tooltip>
              <InputLabel>Product Application Rate (L/ha)</InputLabel>
              <TextField
                disabled
                style={{ display: 'none' }}
                type="number"
                id="product-application-rate"
                value={herbicide?.product_application_rate?.toFixed(3)}
                variant="outlined"
                key={noTankProductApplicationRateLHAKey}
                onKeyDown={(event) => {
                  if (event.code === 'Backspace') {
                    setCurrentHerbicide((prevFields) => ({
                      ...prevFields,
                      product_application_rate: undefined
                    }));
                  }
                }}
                onBlur={(event) => {
                  const input = event.target.value;
                  if (input === '') {
                    setCurrentHerbicide((prevFields) => ({
                      ...prevFields,
                      product_application_rate: undefined
                    }));
                  }
                  if (!isNumber(input)) {
                    setNoTankProductApplicationRateLHAKey(Math.random().toString());
                    return;
                  }
                  setCurrentHerbicide((prevFields) => ({
                    ...prevFields,
                    product_application_rate: Number(input)
                  }));
                }}
                defaultValue={undefined}
              />
            </div>
          )}
        </>
      )}
      <Button
        disabled={formDetails.disabled}
        onClick={() => {
          if (insideTankMix) {
            setFormDetails((prevDetails) => {
              const newHerbicidesArr = [...prevDetails.form_data.tank_mix_object.herbicides];
              newHerbicidesArr.splice(index, 1);
              return {
                ...prevDetails,
                form_data: {
                  ...prevDetails.form_data,
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
              newHerbicidesArr.splice(index, 1);
              return {
                ...prevDetails,
                form_data: { ...prevDetails.form_data, herbicides: newHerbicidesArr }
              };
            });
          }
        }}
        variant="contained"
        startIcon={<DeleteIcon />}
        color="secondary"
      >
        Remove Herbicide
      </Button>
    </div>
  );
};

export default Herbicide;
