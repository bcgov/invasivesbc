import { createAction } from '@reduxjs/toolkit';

class ChemicalTreatments {
  static readonly PREFIX = 'ChemicalTreatments';
  static readonly onChemicalTreatmentsUpdate = createAction<Record<PropertyKey, any>>(
    `${this.PREFIX}/onChemicalTreatmentsUpdate`
  );
}

export default ChemicalTreatments;
