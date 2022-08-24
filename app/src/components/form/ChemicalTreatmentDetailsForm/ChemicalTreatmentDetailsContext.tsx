import { ClassNameMap } from '@mui/styles';
import * as React from 'react';
import { IGeneralFields } from './Models';

export interface IChemicalDetailsContextformDetails {
  form_data?: IGeneralFields;
  errors?: any[];
  herbicideDictionary?: any;
  businessCodes?: any;
  activitySubType?: any;
  disabled?: boolean;
  classes?: ClassNameMap;
}

interface IChemicalTreatmentDetailsContext {
  formDetails: IChemicalDetailsContextformDetails;
  setFormDetails: React.Dispatch<React.SetStateAction<IChemicalDetailsContextformDetails>>;
}

export const ChemicalTreatmentDetailsContext = React.createContext<IChemicalTreatmentDetailsContext>({
  formDetails: {},
  setFormDetails: () => {}
});

export const ChemicalTreatmentDetailsContextProvider = (props) => {
  return (
    <ChemicalTreatmentDetailsContext.Provider value={props.value}>
      {props.children}
    </ChemicalTreatmentDetailsContext.Provider>
  );
};
