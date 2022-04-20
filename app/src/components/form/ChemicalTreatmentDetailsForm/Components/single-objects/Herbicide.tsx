import { Typography, Box, Button, TextField, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { IHerbicide } from '../../Models';
import CustomAutoComplete from '../../CustomAutoComplete';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
//import { isNumber } from 'lodash';
import isNumber from 'is-number';

export interface IHerbicideComponent {
  herbicide: any;
  key?: number;
  index: number;
  classes: any;
  insideTankMix?: boolean;
}

const Herbicide: React.FC<IHerbicideComponent> = ({ herbicide, index, classes, insideTankMix }) => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;
  const [rerenderNumberInputkey, setRerenderNumberInputkey] = useState('0');

  const businessCodes = formDetails.businessCodes;
  const chemicalApplicationMethod = formDetails.formData.chemical_application_method;
  const tankMixOn = formDetails.formData.tank_mix;

  const [product_application_rate_g_ha, setproduct_application_rate_g_ha] = useState(undefined);

  useEffect(() => {
    console.log('prod app rate: ', product_application_rate_g_ha);
  }, [product_application_rate_g_ha, setproduct_application_rate_g_ha]);

  useEffect(() => {
    if (!product_application_rate_g_ha || isNaN(product_application_rate_g_ha)) {
      return;
    } else {
      setCurrentHerbicide((prevFields) => ({
        ...prevFields,
        product_application_rate: Number(product_application_rate_g_ha) / 1000
      }));
    }
  }, [product_application_rate_g_ha]);

  //get arrays for spray and direct chemical methods
  const chemical_method_direct_code_values = businessCodes['chemical_method_direct'].map((code) => {
    return code.value;
  });
  const chemicalApplicationMethodType = chemical_method_direct_code_values.includes(chemicalApplicationMethod)
    ? 'direct'
    : 'spray';

  const [currentHerbicide, setCurrentHerbicide] = useState<IHerbicide>(
    insideTankMix ? formDetails.formData.tank_mix_object.herbicides[index] : formDetails.formData.herbicides[index]
  );

  const herbicideTypeChoices =
    chemicalApplicationMethodType === 'spray'
      ? businessCodes['herbicide_type_code']
      : chemicalApplicationMethodType === 'direct'
      ? businessCodes['herbicide_type_code'].filter((herb) => {
          return herb.value === 'L';
        })
      : [];
  const calculationTypeChoices =
    chemicalApplicationMethodType === 'spray'
      ? businessCodes['calculation_type_code']
      : chemicalApplicationMethodType === 'direct'
      ? businessCodes['calculation_type_code'].filter((calcType) => {
          return calcType.value === 'D';
        })
      : [];

  const [herbicideChoices, setHerbicideChoices] = useState<any[]>(
    herbicide.herbicide_type_code === 'G'
      ? businessCodes.granular_herbicide_code
      : herbicide.herbicide_type_code === 'L'
      ? businessCodes.liquid_herbicide_code
      : []
  );

  //creating valueLabels to to get the lable for heading
  let optionValueLabels = {};
  const herbicide_type_code =
    herbicide.herbicide_type_code === 'G' ? 'granular_herbicide_code' : 'liquid_herbicide_code';
  Object.values(businessCodes[herbicide_type_code] as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

  //update herbicide choices for autocomplete field
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

  //update this herbicide inside context
  useEffect(() => {
    if (currentHerbicide !== herbicide) {
      if (insideTankMix) {
        setFormDetails((prevDetails) => {
          const newHerbArr = [...formDetails.formData.tank_mix_object.herbicides];
          newHerbArr[index] = currentHerbicide;
          return {
            ...prevDetails,
            formData: {
              ...prevDetails.formData,
              tank_mix_object: {
                ...prevDetails.formData.tank_mix_object,
                herbicides: newHerbArr
              }
            }
          };
        });
      } else {
        setFormDetails((prevDetails) => {
          const newHerbArr = [...formDetails.formData.herbicides];
          newHerbArr[index] = currentHerbicide;
          return {
            ...prevDetails,
            formData: { ...prevDetails.formData, herbicides: newHerbArr }
          };
        });
      }
    }
  }, [currentHerbicide]);

  return (
    <>
      <Box component="span" className={classes.listItemContainer}>
        <Typography className={classes.speciesHeading} variant="h5">
          {optionValueLabels[herbicide.herbicide_code]
            ? optionValueLabels[herbicide.herbicide_code]
            : `Herbicide #${index + 1}`}
        </Typography>

        <Tooltip
          style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
          placement="left"
          title="Choose whether the herbicide being used is liquid or granular">
          <HelpOutlineIcon />
        </Tooltip>
        <CustomAutoComplete
          disabled={formDetails.disabled}
          choices={herbicideTypeChoices}
          className={'inputField'}
          classes={classes}
          id={'herbicide-type'}
          key={'herbicide-type'}
          actualValue={herbicide.herbicide_type_code}
          label={'Herbicide Type'}
          parentState={{ herbicide, setCurrentHerbicide }}
          onChange={(event, value) => {
            if (value === null) {
              return;
            }

            setCurrentHerbicide((prevHerbicide) => {
              return { ...prevHerbicide, herbicide_type_code: (value as any).value };
            });
          }}
        />

        <Tooltip
          style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
          placement="left"
          title="Choose which herbicide you are using">
          <HelpOutlineIcon />
        </Tooltip>
        <CustomAutoComplete
          disabled={formDetails.disabled}
          choices={herbicideChoices}
          className={'inputField'}
          classes={classes}
          id={'herbicide-code'}
          label={'Herbicide'}
          actualValue={herbicide.herbicide_code}
          parentState={{ herbicide, setCurrentHerbicide }}
          onChange={(event, value) => {
            if (value === null) {
              return;
            }
            setCurrentHerbicide((prevHerbicide) => {
              return { ...prevHerbicide, herbicide_code: (value as any).value };
            });
          }}
        />

        {!tankMixOn && (
          <>
            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Product application rate: the label recommended rate for treatment of this species that was used to mix the treatment solution. In litres per hectare. Dilution % : the label recommended percent solution used to treat this species that was used to mix the treatment solution. Expressed as the percent of herbicide in the solution.">
              <HelpOutlineIcon />
            </Tooltip>
            <CustomAutoComplete
              disabled={formDetails.disabled}
              choices={calculationTypeChoices}
              className={'inputField'}
              classes={classes}
              id={'calculation_type'}
              label={'Calculation Type'}
              actualValue={herbicide.calculation_type}
              parentState={{ herbicide, setCurrentHerbicide }}
              onChange={(event, value) => {
                if (value === null) {
                  return;
                }
                setCurrentHerbicide((prevHerbicide) => {
                  return { ...prevHerbicide, calculation_type: (value as any).value };
                });
              }}
            />
          </>
        )}

        {tankMixOn && (
          <>
            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Recommended label rate for herbicide (L/ha) used for this treatment">
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              className={classes.inputField}
              type="text"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              // error={currentHerbicideErrorSchema?.product_application_rate?.__errors?.length > 0 || false}
              label={
                herbicide?.herbicide_type_code === 'G'
                  ? 'Product Application Rate (g/ha)'
                  : 'Product Application Rate (l/ha)'
              }
              // helperText={currentHerbicideErrorSchema?.product_application_rate?.__errors[0] || ''}
              value={herbicide?.product_application_rate}
              variant="outlined"
              onChange={(event) => {
                const input = event.target.value;
                console.log('Event: ', input);
                console.log('typeof event: ', typeof input);

                if (input === '') {
                  console.log('Empty string. Setting undefined...');
                  setCurrentHerbicide((prevFields) => {
                    return { ...prevFields, product_application_rate: undefined };
                  });
                  return;
                } else if (isNaN(Number(input))) {
                  console.log('Not a number. Will not update!');
                  event.stopPropagation();
                  event.preventDefault();
                  return;
                } else {
                  console.log('Setting product application rate: ', Number(input));
                  setCurrentHerbicide((prevFields) => ({
                    ...prevFields,
                    product_application_rate: Number(input)
                  }));
                }
              }}
              defaultValue={undefined}
            />
          </>
        )}

        {!tankMixOn && (
          <>
            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Volume in litres (ie 5.1 L) of herbicide and water mix">
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              id="amount-of-mix-used"
              className={classes.inputField}
              type="number"
              label="Amount of Mix Used (L)"
              value={herbicide?.amount_of_mix}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  amount_of_mix: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />
          </>
        )}

        {!tankMixOn && currentHerbicide?.calculation_type === 'D' ? (
          <>
            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Percent (%) of product in the mix">
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              id="dilution"
              className={classes.inputField}
              type="number"
              label="Dilution (%)"
              value={herbicide?.dilution}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  dilution: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />

            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Area Treated in square meters">
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              id="area-treated"
              className={classes.inputField}
              type="number"
              label="Area Treated (sqm)"
              value={herbicide.area_treated_sqm}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  area_treated_sqm: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />
          </>
        ) : !tankMixOn && currentHerbicide?.calculation_type === 'PAR' ? (
          <>
            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Calibrated delivery rate of the device used to apply herbicide in L/ha">
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              className={classes.inputField}
              type="number"
              id="delivery-rate-of-mix"
              label="Delivery Rate of Mix (L/ha)"
              value={herbicide.delivery_rate_of_mix}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  delivery_rate_of_mix: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />

            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Recommended label rate for herbicide (g/ha) used for this treatment">
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled}
              className={classes.inputField}
              type="text"
              id="product-application-rate"
              label="Product Application Rate (g/ha)"
              value={product_application_rate_g_ha}
              key={rerenderNumberInputkey}
              variant="outlined"
              onChange={(event) => {
                const input = event.target.value;
                if (!isNumber(event.target.value)) {
                  setRerenderNumberInputkey('herbnumberinputNotank ' + Math.random());
                  return;
                }
                setproduct_application_rate_g_ha(Number(input));
              }}
              defaultValue={undefined}
            />

            <Tooltip
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Recommended label rate for herbicide (L/ha) used for this treatment">
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              disabled={formDetails.disabled || true}
              className={classes.inputField}
              type="number"
              id="product-application-rate"
              label="Product Application Rate (L/ha)"
              value={herbicide.product_application_rate}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  product_application_rate: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />
          </>
        ) : null}

        <Button
          disabled={formDetails.disabled}
          onClick={() => {
            if (insideTankMix) {
              setFormDetails((prevDetails) => {
                const newHerbicidesArr = [...prevDetails.formData.tank_mix_object.herbicides];
                newHerbicidesArr.splice(index, 1);
                return {
                  ...prevDetails,
                  formData: {
                    ...prevDetails.formData,
                    tank_mix_object: {
                      ...prevDetails.formData.tank_mix_object,
                      herbicides: newHerbicidesArr
                    }
                  }
                };
              });
            } else {
              setFormDetails((prevDetails) => {
                const newHerbicidesArr = [...prevDetails.formData.herbicides];
                newHerbicidesArr.splice(index, 1);
                return {
                  ...prevDetails,
                  formData: { ...prevDetails.formData, herbicides: newHerbicidesArr }
                };
              });
            }
          }}
          variant="contained"
          className={classes.speciesRemoveButton}
          startIcon={<DeleteIcon />}
          color="secondary">
          Remove Herbicide
        </Button>
      </Box>
    </>
  );
};

export default Herbicide;
