import { getAreaValidator } from 'rjsf/business-rules/custom-validation/validators/area';
import {
  getDateAndTimeValidator,
  getDateAndTimeValidatorOther
} from 'rjsf/business-rules/custom-validation/validators/date-time';
import { getSlopeAspectBothFlatValidator } from 'rjsf/business-rules/custom-validation/validators/slope-aspect';
import {
  getPosAndNegObservationValidator,
  getPosAndNegObservationValidatorAquatic
} from 'rjsf/business-rules/custom-validation/validators/observations';
import { getTreatedAreaValidator } from 'rjsf/business-rules/custom-validation/validators/treatment';
import {
  getInvasivePlantsValidator,
  getTargetPhenologySumValidator,
  getTerrestrialAquaticPlantsValidator
} from 'rjsf/business-rules/custom-validation/validators/invasive-plants';
import { getShorelineTypesPercentValidator } from 'rjsf/business-rules/custom-validation/validators/shoreline';
import { transferErrorsFromChemDetails } from 'rjsf/business-rules/custom-validation/validators/chemical';
import {
  getTransectOffsetDistanceValidator,
  getVegTransectPointsPercentCoverValidator
} from 'rjsf/business-rules/custom-validation/validators/transect';
import { getPlotIdentificationTreesValidator } from 'rjsf/business-rules/custom-validation/validators/frep';
import {
  getTemperatureValidator,
  getWindValidator,
  getWindValidatorBiocontrol
} from 'rjsf/business-rules/custom-validation/validators/weather';
import { getJurisdictionPercentValidator } from 'rjsf/business-rules/custom-validation/validators/jurisdiction';
import { getPestManagementPlanValidator } from 'rjsf/business-rules/custom-validation/validators/pmp';
import { accessDescriptionMinChars } from 'rjsf/business-rules/custom-validation/validators/access-description';
import { combineValidators, rjsfValidator } from 'rjsf/business-rules/custom-validation/utils';
import { chemicalTreatmentFormIsValid } from 'rjsf/business-rules/custom-validation/validators/chemical-treatment-form';

function validatorForActivity(activity_subtype: string, linkedActivity): rjsfValidator {
  return combineValidators([
    getAreaValidator(activity_subtype),
    getDateAndTimeValidator(activity_subtype),
    getDateAndTimeValidatorOther(activity_subtype),
    getWindValidator(activity_subtype),
    getWindValidatorBiocontrol(activity_subtype),
    getTemperatureValidator(activity_subtype),
    chemicalTreatmentFormIsValid(),
    getSlopeAspectBothFlatValidator(),
    getPosAndNegObservationValidator(),
    getPosAndNegObservationValidatorAquatic(),
    getTreatedAreaValidator(),
    getTargetPhenologySumValidator(),
    getTerrestrialAquaticPlantsValidator(),
    getShorelineTypesPercentValidator(),
    getPestManagementPlanValidator(),
    transferErrorsFromChemDetails(),
    getTransectOffsetDistanceValidator(),
    getVegTransectPointsPercentCoverValidator(),
    getJurisdictionPercentValidator(),
    getInvasivePlantsValidator(linkedActivity),
    getPlotIdentificationTreesValidator(activity_subtype),
    accessDescriptionMinChars()
  ]);
}

export { validatorForActivity };
