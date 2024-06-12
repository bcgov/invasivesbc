import { Box, CircularProgress, createTheme, ThemeOptions, ThemeProvider, Typography } from '@mui/material';
import { Form } from '@rjsf/mui';
import FormType from '@rjsf/core';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { validatorForActivity } from 'rjsf/business-rules/customValidation';
import { SelectAutoCompleteContextProvider } from 'UI/Overlay/Records/Activity/form/SelectAutoCompleteContext';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import RootUISchemas from 'rjsf/uiSchema/RootUISchemas';
import MultiSelectAutoComplete from 'rjsf/widgets/MultiSelectAutoComplete';
import SingleSelectAutoComplete from 'rjsf/widgets/SingleSelectAutoComplete';
import rjsfTheme from 'UI/Overlay/Records/Activity/form/rjsfTheme';
import ChemicalTreatmentDetailsForm from './ChemicalTreatmentDetailsForm/ChemicalTreatmentDetailsForm';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import {
  ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
  ACTIVITY_ERRORS,
  ACTIVITY_ON_FORM_CHANGE_REQUEST
} from 'state/actions';
import validator from '@rjsf/validator-ajv8';
import 'UI/Overlay/Records/Activity/form/aditionalFormStyles.css';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import debounce from 'lodash.debounce';
import { RENDER_DEBUG } from 'UI/App';

const FormContainer: React.FC = () => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%c FormContainer render:' + ref.current.toString(), 'color: yellow');

  const authenticated = useSelector((state) => state.Auth.authenticated);
  const username = useSelector((state) => state.Auth.username);
  const accessRoles = useSelector((state) => state.Auth.accessRoles);

  const formDataState = useSelector((state) => state.ActivityPage.activity.form_data);
  const pasteCount = useSelector((state) => state.ActivityPage.pasteCount);

  const activity_subtype = useSelector((state) => state.ActivityPage.activity.activity_subtype);
  const activity_type = useSelector((state) => state.ActivityPage.activity.activity_type);
  const activity_ID = useSelector((state) => state.ActivityPage.activity.activity_id);
  const created_by = useSelector((state) => state.ActivityPage.activity.created_by);

  const MOBILE = useSelector((state) => state.Configuration.current.MOBILE);
  const darkTheme = useSelector((state) => state.UserSettings.darkTheme);

  const apiDocsWithViewOptions = useSelector((state) => state.UserSettings.apiDocsWithViewOptions);
  const apiDocsWithSelectOptions = useSelector((state) => state.UserSettings.apiDocsWithSelectOptions);

  const suggestedTreatmentIDS = useSelector((state) => state.ActivityPage.suggestedTreatmentIDs);

  const dispatch = useDispatch();

  const debouncedFormChange = useCallback(
    debounce((event, ref, lastField) => {
      dispatch(
        ACTIVITY_ON_FORM_CHANGE_REQUEST({
          eventFormData: event.formData,
          lastField: lastField,
          unsavedDelay: null
        })
      );
    }, 1000),
    []
  );

  const customValidators = useCallback(() => {
    return validatorForActivity(activity_subtype, null);
  }, [JSON.stringify(activity_subtype)]);

  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });
  const formRef = useRef<FormType>(null);

  const rjsfThemeDark = createTheme({
    ...rjsfTheme,
    palette: { ...rjsfTheme.palette, mode: 'dark' }
  } as ThemeOptions);
  const rjsfThemeLight = createTheme(rjsfTheme as ThemeOptions);

  useEffect(() => {
    if (formRef.current && formRef.current.state && formRef.current.state.errors)
      dispatch(ACTIVITY_ERRORS(formRef.current.state.errors));
  }, [formRef]);

  const isActivityChemTreatment = () => {
    if (
      activity_subtype === 'Activity_Treatment_ChemicalPlantTerrestrial' ||
      activity_subtype === 'Activity_Treatment_ChemicalPlantAquatic'
    ) {
      return true;
    }
  };

  const ErrorListTemplate = (err: any) => {
    return (
      <>
        {err.errors?.length > 0 ? (
          <div>
            <br></br>
            <br></br>
            <br></br>
            <Typography color="error" variant="h6">
              Red text indicates mandatory entry in order to go from a status of Draft to Submitted. You can however
              save in progress work, and come back later.
            </Typography>
          </div>
        ) : null}
      </>
    );
  };

  useEffect(() => {
    const getApiSpec = async () => {
      const subtype = activity_subtype;
      if (!subtype) throw new Error('Activity has no Subtype specified');
      let components;
      const notMine = username !== created_by;
      const notAdmin =
        accessRoles?.filter((role) => {
          return [1, 18].includes(role.role_id);
        }).length === 0;
      if (notAdmin && notMine) {
        components = (apiDocsWithViewOptions as any).components;
      } else if (!notAdmin && notMine) {
        components = (apiDocsWithViewOptions as any).components;
      } else {
        components = (apiDocsWithSelectOptions as any).components;
      }

      let uiSchema = RootUISchemas[subtype];
      const subtypeSchema = components?.schemas?.[subtype];
      let modifiedSchema = subtypeSchema;
      // Handle activity_id linking fetches
      try {
        //const suggestedTreatmentIDs = activityStateInStore?.suggestedTreatmentIDs ?? [];

        if (activity_type === 'Monitoring') {
          if (MOBILE) {
            uiSchema = {
              ...uiSchema,
              activity_type_data: {
                ...uiSchema?.activity_type_data,
                linked_id: {
                  ...uiSchema?.activity_type_data?.linked_id,
                  'ui:widget': undefined
                }
              }
            };
          } else {
            try {
              // move this to action or reducer
              if (suggestedTreatmentIDS?.length) {
                modifiedSchema = {
                  ...modifiedSchema,
                  properties: {
                    ...modifiedSchema?.properties,
                    activity_type_data: {
                      ...modifiedSchema?.properties.activity_type_data,
                      properties: {
                        ...modifiedSchema?.properties.activity_type_data.properties,
                        linked_id: {
                          ...modifiedSchema?.properties?.activity_type_data?.properties?.linked_id,
                          options: suggestedTreatmentIDS
                        }
                      }
                    }
                  }
                };
                components = {
                  ...components,
                  schemas: {
                    ...components.schemas,
                    [activity_subtype]: modifiedSchema
                  }
                };
              }
            } catch (e) {
              console.dir(e);
            }
          }
        }
      } catch (error) {
        console.log('Could not load Activity IDs of linkable records');
      }
      setSchemas({
        schema: { ...modifiedSchema, components: components },
        uiSchema: uiSchema
      });
    };
    if (authenticated) {
      getApiSpec();
    }
  }, [
    JSON.stringify(activity_subtype),
    JSON.stringify(authenticated),
    JSON.stringify(MOBILE),
    JSON.stringify(suggestedTreatmentIDS)
  ]);

  const [isDisabled, setIsDisabled] = useState(false);
  useEffect(() => {
    const notMine = username !== created_by;
    const notAdmin =
      accessRoles?.filter((role) => {
        return role.role_id === 18;
      }).length === 0;
    if (notAdmin && notMine) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [JSON.stringify(accessRoles), JSON.stringify(username)]);

  // useEffect() => {
  //   () => {
  //     props.pasteFormData();
  //     setTimeout(() => {
  //       setKeyInt(keyInt + Math.random());
  //     }, 1500);
  //   };
  // }
  //
  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  } else {
    return (
      <Box sx={{ pl: '15%', pr: '15%' }}>
        <ThemeProvider theme={darkTheme ? rjsfThemeDark : rjsfThemeLight}>
          <SelectAutoCompleteContextProvider>
            <>
              <Form
                templates={{
                  ObjectFieldTemplate: ObjectFieldTemplate,
                  FieldTemplate: FieldTemplate,
                  ArrayFieldTemplate: ArrayFieldTemplate,
                  ErrorListTemplate: ErrorListTemplate
                }}
                widgets={{
                  'multi-select-autocomplete': MultiSelectAutoComplete,
                  'single-select-autocomplete': SingleSelectAutoComplete
                }}
                readonly={isDisabled}
                key={activity_ID + pasteCount}
                disabled={isDisabled}
                formData={formDataState || null}
                schema={schemas.schema}
                uiSchema={schemas.uiSchema}
                liveValidate={true}
                customValidate={customValidators()}
                validator={validator}
                showErrorList={'top'}
                transformErrors={getCustomErrorTransformer()}
                autoComplete="off"
                onChange={(event) => {
                  debouncedFormChange(event, formRef, null);
                }}
                /*onSubmit={(event) => {
                  if (!props.onFormSubmitSuccess) {
                    return;
                  }
                  try {
                    props.onFormSubmitSuccess(event, formRef);
                  } catch (e) {
                    console.log(e);
                  }
                }}*/
                ref={formRef}
              >
                <React.Fragment />
              </Form>
              {isActivityChemTreatment() && (
                <ChemicalTreatmentDetailsForm
                  disabled={isDisabled}
                  activitySubType={activity_subtype || null}
                  onChange={(form_data, callback) => {
                    //todo redux chem treatment form on change
                    dispatch(
                      ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST({
                        eventFormData: form_data
                      })
                    );
                    if (callback !== null) {
                      callback();
                    }
                  }}
                  form_data={formDataState}
                  schema={schemas.schema}
                />
              )}
            </>
          </SelectAutoCompleteContextProvider>
        </ThemeProvider>
      </Box>
    );
  }
};

export default FormContainer;
