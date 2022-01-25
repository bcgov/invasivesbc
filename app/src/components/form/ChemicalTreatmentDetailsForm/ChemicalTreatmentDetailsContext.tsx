import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';
import { IGeneralFields } from './Models';

export interface IChemicalDetailsContextformDetails {
  formData?: IGeneralFields;
  errors?: any[];
  herbicideDictionary?: any;
  businessCodes?: any;
  activitySubType?: any;
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
