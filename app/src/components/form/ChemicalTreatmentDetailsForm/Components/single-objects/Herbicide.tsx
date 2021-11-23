import { Typography, Box, Button, TextField, Tooltip } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useContext, useEffect, useState } from 'react';
import { IHerbicide } from '../../Models';
import CustomAutoComplete from '../../CustomAutoComplete';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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

  const businessCodes = formDetails.businessCodes;
  const chemicalApplicationMethod = formDetails.formData.chemical_application_method;
  const tankMixOn = formDetails.formData.tank_mix;

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

  const [herbicideTypeChoices, setHerbicideTypeChoices] = useState<any[]>([]);
  const [herbicideChoices, setHerbicideChoices] = useState<any[]>([]);
  const [calculationTypeChoices, setCalculationTypeChoices] = useState<any[]>([]);

  //creating valueLabels to to get the lable for heading
  let optionValueLabels = {};
  const herbicide_type_code =
    herbicide.herbicide_type_code === 'G' ? 'granular_herbicide_code' : 'liquid_herbicide_code';
  Object.values(businessCodes[herbicide_type_code] as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

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

  //update herbicide type and calc type choices for autocomplete fields
  useEffect(() => {
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
  }, [chemicalApplicationMethodType]);

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
              title="Product application rate: the label recommended rate for treatment of this species that was used to mix the treatment solution. In litres per hectare. Dilution % : the label recommended percent solution used to treat this species that was used to mix the treatment solution. Expressed as the percent of herbicide in the solution. Example: 25% = 25% herbicide concentrate in the treatment solution. See spreadsheet for where this field should go.">
              <HelpOutlineIcon />
            </Tooltip>
            <CustomAutoComplete
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
              className={classes.inputField}
              type="number"
              // error={currentHerbicideErrorSchema?.product_application_rate?.__errors?.length > 0 || false}
              label="Product Application Rate (l/ha)"
              // helperText={currentHerbicideErrorSchema?.product_application_rate?.__errors[0] || ''}
              value={herbicide?.product_application_rate || ''}
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
              className={classes.inputField}
              type="number"
              label="Amount of Mix Used"
              value={herbicide?.amount_of_mix || ''}
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
              className={classes.inputField}
              type="number"
              label="Dilution"
              value={herbicide?.dilution || ''}
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
              className={classes.inputField}
              type="number"
              label="Area Treated (sqm)"
              value={herbicide.area_treated_sqm || ''}
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
              className={classes.inputField}
              type="number"
              label="Delivery Rate of Mix"
              value={herbicide.delivery_rate_of_mix || ''}
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
              title="Recommended label rate for herbicide (L/ha) used for this treatment">
              <HelpOutlineIcon />
            </Tooltip>
            <TextField
              className={classes.inputField}
              type="number"
              // error={currentHerbicideErrorSchema?.application_rate?.__errors?.length > 0}
              label="Product Application Rate"
              // helperText={currentHerbicideErrorSchema?.application_rate?.__errors[0] || ''}
              value={herbicide.product_application_rate || ''}
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
