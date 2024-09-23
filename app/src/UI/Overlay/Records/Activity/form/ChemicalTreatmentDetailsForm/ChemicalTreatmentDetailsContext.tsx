//import { ClassNameMap } from '@mui/styles';
import { RENDER_DEBUG } from 'UI/App';
import * as React from 'react';

export interface IChemicalDetailsContextformDetails {
  form_data?: any;
  errors?: any[];
  herbicideDictionary?: any;
  businessCodes?: any;
  activitySubType?: any;
  disabled?: boolean;
  classes?: any;
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
  const ref = React.useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%cChemTreatmentDetailsForm:' + ref.current.toString(), 'color: yellow');
  }
  return (
    <ChemicalTreatmentDetailsContext.Provider value={props.value}>
      {props.children}
    </ChemicalTreatmentDetailsContext.Provider>
  );
};
