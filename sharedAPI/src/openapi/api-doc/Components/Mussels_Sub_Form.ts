/**
 * @desc Mussel Form logic for Watercraft Inspectors. Contains all the subcomponents used to create Inspections
 * @author LocalNewsTV davidclaveau
 */

/*** Common Fields ***/
/** @desc Boolean Subcomponent using Radio buttons for Yes/No Response */
export const NullSwitch = {
  type: 'boolean',
  oneOf: [
    {
      title: 'Yes',
      const: true
    },
    {
      title: 'No',
      const: false
    }
  ]
};

/*** All Form Fields ***/
/* Passport Fields */
const LaunchedOutsideBC = {
  title: 'Launched Outside BC/AB in the last 30 days',
  ...NullSwitch
};

const PassportNumber = {
  title: 'Passport Number',
  type: 'string'
};

export const MarineSpeciesFound = {
  title: 'Marine Species Found',
  ...NullSwitch
};

/* Basic Information Form Subcomponents */
/** @desc Select Form Subcomponent capturing Province/State information */
export const Province = {
  type: 'string',
  title: 'Province/State Name',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'province_state_name',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Province / state name'
};

/** @desc date-time form subcomponent for capturing the inspection time of watercraft */
export const InspectionTime = {
  title: 'Inspection Time',
  type: 'string',
  format: 'date-time',
  'x-tooltip-text': 'Time inspection occurred'
};

/* Vehicle Counter form subcomponents */
export const IntStepper = {
  type: 'integer',
  default: 0
};

/* End of 'Basic Information' form subcomponents */
/* 'Watercraft Details' form subcomponents */

export const CommerciallyHauled = {
  title: 'Commercially Hauled',
  ...NullSwitch
};

/** @desc Boolean Yes/No subcomponent for knowledge about 'Aquatic Invasive Species' */
export const PreviousAISKnowledge = {
  title: 'Previous AIS Knowledge',
  ...NullSwitch
};

/** @desc Select menu form subcomponent for where 'Aquatic Invasive Species' knowledge gained */
export const PreviousAISKnowledgeSource = {
  type: 'string',
  title: 'Source of Previous AIS Knowledge or Clean, Drain, Dry',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'previous_ais_knowledge_source',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Source of Previous AIS Knowledge or Clean, Drain, Dry'
};

export const PreviousInspection = {
  title: 'Previous inspection and/or agency notification',
  ...NullSwitch
};

/** @desc Select form subcomponent for where previous watercraft inspection was conducted */
export const PreviousInspectionSource = {
  type: 'string',
  title: 'Previous Inspection and/or Agency Notification Source',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'previous_inspection_source',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Previous Inspection and/or Agency Notification Source'
};

/** @desc Time since previous inspection had occurred  */
export const PreviousInspectionDays = {
  type: 'string',
  title: 'Previous Inspection and/or Agency Notification Number of Days',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'previous_inspection_days',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Previous Inspection and/or Agency Notification Number of Days'
};
/* End of 'Watercraft Details' form subcomponents*/

/* 'Journey Details' form subcomponents */
export const MajorCity = {
  type: 'string',
  title: 'Major city name',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'major_cities',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Major city name'
};

/** @desc Boolean trigger for entering manual waterbodies in form */
export const ManualWaterbody = {
  title: 'Manually Enter a Waterbody',
  type: 'boolean',
  default: false
};

/** @desc Text field for User to manually submit a waterbody name */
export const ManualWaterbodyName = {
  title: 'Manually enter the waterbody name',
  type: 'string'
};
/** @desc Text field for User to manually submit a waterbody nearest city */
export const ManualWaterbodyCity = {
  title: 'Manually enter the city for the waterbody',
  type: 'string'
};

/** @desc Text field for User to manually submit a waterbody country */
export const ManualWaterbodyCountry = {
  title: 'Manually enter the country for the waterbody',
  type: 'string'
};

/** @desc Select form subcomponent for selecting Waterbody location of previous travel */
export const PreviousWaterbody = {
  type: 'string',
  title: 'Waterbody Name',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'waterbody_name',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Waterbody name'
};

/** @desc Select subcomponent for time since watercraft was in a specified waterbody */
export const NumberOfDaysOut = {
  type: 'string',
  title: 'Number of days out of waterbody',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'time_out_of_waterbody',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  }
};

/** @desc Select dropdown for Major city a boat was previously held in */
export const PreviousMajorCity = {
  ...MajorCity
};

/** @desc Select form subcomponent to indicate where the boat was previously coming from or held  */
export const PreviousUnknownCommercialStorageDropdown = {
  title: 'Previous Location Known?',
  type: 'string',
  enum: [
    'Known Waterbody',
    'Unknown Previous Waterbody',
    'Commercial Manufacturer as Previous Water Body',
    'Previous Dry Storage'
  ],
  default: 'Known Waterbody'
};

export const DestinationMajorCity = {
  ...MajorCity
};

/** @desc Select form subcomponent for selecting destination Waterbody of travel */
export const DestinationWaterbody = {
  type: 'string',
  title: 'Waterbody Name',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'waterbody_name',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Waterbody name'
};

export const DestinationUnknownCommercialStorageDropdown = {
  title: 'Destination Location Known?',
  type: 'string',
  enum: [
    'Known Waterbody',
    'Unknown Destination Waterbody',
    'Commercial Manufacturer as Destination Water Body',
    'Destination Dry Storage'
  ],
  default: 'Known Waterbody'
};

/* End of Journey Details */
/* 'Inspection Details' form subcomponents */

export const AquaticPlantsFound = {
  title: 'Aquatic plants found',
  ...NullSwitch
};

export const MarineMusselsFound = {
  title: 'Marine Mussels Found',
  ...NullSwitch
};

export const HighRiskArea = {
  title: 'Watercraft coming from a high risk area for whirling disease',
  ...NullSwitch
};

export const DreissenidMusselsFoundPrevious = {
  title: 'Dreissenid mussels found during inspection and FULL decontamination already completed/determined to be CDD',
  ...NullSwitch
};

export const K9Inspection = {
  title: 'K9 Inspection',
  ...NullSwitch
};

export const K9InspectionResults = {
  title: 'K9 Inspection Result',
  type: 'string',
  enum: ['K9 detected/indicated', 'K9 did not indicate']
};
/*	End of Inspection Details */

/* High Risk */
export const WatercraftRegistration = {
  title: 'Boat registration # (if applicable)',
  type: 'string'
};

export const AdultDreissenidMusselsFound = {
  title: 'Adult Dreissenid Mussels Found',
  ...NullSwitch
};

export const AdultDreissenidMusselsLocation = {
  type: 'string',
  title: 'Add a location',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'watercraft_locations',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Location on watercraft where standing water / mussels were found'
};

export const AdultDreissenidMusselsLocationArray = {
  title: 'Adult Dreissenid Mussels Location',
  type: 'array',
  minItems: 1,
  items: {
    ...AdultDreissenidMusselsLocation
  }
};

export const AdultDreissenidMusselsFoundLogic = {
  type: 'object',
  title: 'invisible',
  properties: {
    adultDreissenidMusselsFound: AdultDreissenidMusselsFound
  },
  required: ['adultDreissenidMusselsFound'],
  dependencies: {
    adultDreissenidMusselsFound: {
      oneOf: [
        {
          properties: {
            adultDreissenidMusselsFound: {
              enum: [false]
            }
          }
        },
        {
          properties: {
            adultDreissenidMusselsFound: {
              enum: [true]
            },
            adultDreissenidMusselsLocation: AdultDreissenidMusselsLocationArray
          },
          required: ['adultDreissenidMusselsFound', 'adultDreissenidMusselsLocation']
        }
      ]
    }
  }
};

export const StandingWaterPresent = {
  title: 'Standing Water Present',
  ...NullSwitch
};

/** @desc Select Form component for locations of standing water */
export const StandingWaterLocation = {
  type: 'string',
  title: 'Add a location',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'watercraft_locations',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Location on watercraft where standing water / mussels were found'
};

/** @desc Array Form component for containing users locations of standing water, enforces minimum 1 entry */
export const StandingWaterLocationArray = {
  title: 'Standing Water Location',
  type: 'array',
  minItems: 1,
  items: {
    ...StandingWaterLocation
  }
};

/** @desc Used to determine render of standingWaterLocation form component */
export const StandingWaterLogic = {
  type: 'object',
  title: 'invisible',
  properties: {
    standingWaterPresent: StandingWaterPresent
  },
  required: ['standingWaterPresent'],
  dependencies: {
    standingWaterPresent: {
      oneOf: [
        {
          properties: {
            standingWaterPresent: {
              enum: [false]
            }
          }
        },
        {
          properties: {
            standingWaterPresent: {
              enum: [true]
            },
            standingWaterLocation: StandingWaterLocationArray
          },
          required: ['standingWaterLocation']
        }
      ]
    }
  }
};

export const OtherInspectionFindings = {
  title: 'Other Inspection Findings',
  type: 'string',
  enum: ['Aquatic plants found', 'Dirty hull or bilge', 'Live bait', 'Live fish']
};

export const DecontaminationPerformed = {
  title: 'Decontamination Performed',
  ...NullSwitch
};

export const DecontaminationReference = {
  title: 'Record of Decontamination number',
  type: 'string'
};

/** @desc Used to determine render for decontaminationReference form component  */
export const DecontaminationPerformedLogic = {
  type: 'object',
  title: 'invisible',
  required: ['decontaminationPerformed'],
  properties: {
    decontaminationPerformed: DecontaminationPerformed
  },
  dependencies: {
    decontaminationPerformed: {
      oneOf: [
        {
          properties: {
            decontaminationPerformed: {
              enum: [false]
            }
          }
        },
        {
          properties: {
            decontaminationPerformed: {
              enum: [true]
            },
            decontaminationReference: DecontaminationReference
          },
          required: ['decontaminationReference']
        }
      ]
    }
  }
};

export const DecontaminationOrderIssued = {
  title: 'Decontamination Order Issued',
  ...NullSwitch
};

export const DecontaminationOrderNumber = {
  title: 'Decontamination order number',
  type: 'string'
};

/** @desc Select menu for decontamination reason form compoennt */
export const DecontaminationOrderReason = {
  type: 'string',
  title: 'Reason for issuing decontamination order',
  'x-enum-code': {
    'x-enum-code-category-name': 'invasives',
    'x-enum-code-header-name': 'decontamination_order_reason',
    'x-enum-code-name': 'code_name',
    'x-enum-code-text': 'code_description',
    'x-enum-code-sort-order': 'code_sort_order'
  },
  'x-tooltip-text': 'Reason for issuing decontamination order'
};

/** @desc Used to determine render of decontaminationOrderIssued form component */
export const DecontaminationOrderIssuedLogic = {
  type: 'object',
  title: 'invisible',
  required: ['decontaminationOrderIssued'],
  properties: {
    decontaminationOrderIssued: DecontaminationOrderIssued
  },
  dependencies: {
    decontaminationOrderIssued: {
      oneOf: [
        {
          properties: {
            decontaminationOrderIssued: {
              enum: [false]
            }
          }
        },
        {
          properties: {
            decontaminationOrderIssued: {
              enum: [true]
            },
            decontaminationOrderNumber: DecontaminationOrderNumber,
            decontaminationOrderReason: DecontaminationOrderReason
          },
          required: ['decontaminationOrderNumber', 'decontaminationOrderReason']
        }
      ]
    }
  }
};

export const DecontaminationAppendixB = {
  title: 'Appendix B completed and served',
  ...NullSwitch
};

export const SealIssued = {
  title: 'Seal Issued',
  ...NullSwitch
};

export const SealNumber = {
  title: 'Seal #',
  type: 'string'
};

/** @desc Used to determine render of sealNumber form component */
export const SealIssuedLogic = {
  type: 'object',
  title: 'invisible',
  required: ['sealIssued'],
  properties: {
    sealIssued: SealIssued
  },
  dependencies: {
    sealIssued: {
      oneOf: [
        {
          properties: {
            sealIssued: {
              enum: [false]
            }
          }
        },
        {
          properties: {
            sealIssued: {
              enum: [true]
            },
            sealNumber: SealNumber
          },
          required: ['sealNumber']
        }
      ]
    }
  }
};

export const QuarantinePeriodIssued = {
  title: 'Quarantine period issued',
  ...NullSwitch
};
/* End of 'High Risk' form components */
/*** End of all Form Fields ***/

/*** 'Watercraft Details' Section ***/
export const WatercraftDetails_BasicInformation = {
  title: 'invisible',
  type: 'object',
  required: ['numberOfPeopleInParty', 'commerciallyHauled'],
  properties: {
    numberOfPeopleInParty: {
      title: 'Number of People in the Party',
      ...IntStepper
    },
    commerciallyHauled: CommerciallyHauled
  }
};

export const WatercraftDetails_PreviousAISKnowledge = {
  title: 'invisible',
  type: 'object',
  required: ['previousAISKnowledge'],
  properties: {
    previousAISKnowledge: PreviousAISKnowledge
  },
  dependencies: {
    previousAISKnowledge: {
      oneOf: [
        {
          properties: {
            previousAISKnowledge: {
              const: false
            }
          }
        },
        {
          properties: {
            previousAISKnowledge: {
              const: true
            },
            previousAISKnowledgeSource: PreviousAISKnowledgeSource
          },
          required: ['previousAISKnowledgeSource']
        }
      ]
    }
  }
};

export const WatercraftDetails_PreviousInspection = {
  title: 'invisible',
  type: 'object',
  required: ['previousInspection'],
  properties: {
    previousInspection: PreviousInspection
  },
  dependencies: {
    previousInspection: {
      oneOf: [
        {
          properties: {
            previousInspection: {
              const: false
            }
          }
        },
        {
          properties: {
            previousInspection: {
              const: true
            },
            previousInspectionSource: PreviousInspectionSource,
            previousInspectionDays: PreviousInspectionDays
          },
          required: ['previousInspectionSource', 'previousInspectionDays']
        }
      ]
    }
  }
};
/*** End of Watercraft Details ***/

/*** Journey Details Logic ***/
/* Previous */
export const PreviousWaterBodyLogic = {
  title: 'invisible',
  type: 'object',
  properties: {
    manualWaterbody: ManualWaterbody
  },
  dependencies: {
    manualWaterbody: {
      oneOf: [
        {
          properties: {
            manualWaterbody: {
              const: false
            },
            previousWaterbody: PreviousWaterbody,
            numberOfDaysOut: NumberOfDaysOut
          },
          required: ['previousWaterbody', 'numberOfDaysOut']
        },
        {
          properties: {
            manualWaterbody: {
              const: true
            },
            manualWaterbodyName: ManualWaterbodyName,
            manualWaterbodyCity: ManualWaterbodyCity,
            manualWaterbodyCountry: ManualWaterbodyCountry,
            numberOfDaysOut: NumberOfDaysOut,
            previousMajorCity: PreviousMajorCity
          },
          required: [
            'manualWaterbodyName',
            'manualWaterbodyCity',
            'manualWaterbodyCountry',
            'numberOfDaysOut',
            'previousMajorCity'
          ]
        }
      ]
    }
  }
};

export const PreviousWaterBodyArray = {
  type: 'array',
  minItems: 1,
  items: {
    ...PreviousWaterBodyLogic
  }
};

export const PreviousToggles = {
  type: 'object',
  properties: {
    previousUnknownCommercialStorageDropdown: PreviousUnknownCommercialStorageDropdown
  },
  dependencies: {
    previousUnknownCommercialStorageDropdown: {
      oneOf: [
        {
          properties: {
            previousUnknownCommercialStorageDropdown: {
              enum: ['Known Waterbody']
            },
            previousWaterBody: {
              title: 'Add a Previous Waterbody',
              ...PreviousWaterBodyArray
            }
          },
          required: ['previousWaterBody']
        },
        {
          properties: {
            previousUnknownCommercialStorageDropdown: {
              enum: ['Unknown Previous Waterbody']
            },
            previousMajorCity: PreviousMajorCity
          },
          required: ['previousMajorCity']
        },
        {
          properties: {
            previousUnknownCommercialStorageDropdown: {
              enum: ['Commercial Manufacturer as Previous Water Body']
            },
            previousMajorCity: PreviousMajorCity
          },
          required: ['previousMajorCity']
        },
        {
          properties: {
            previousUnknownCommercialStorageDropdown: {
              enum: ['Previous Dry Storage']
            },
            previousMajorCity: PreviousMajorCity
          },
          required: ['previousMajorCity']
        }
      ]
    }
  }
};
/* End of Previous */

/* Destination */
export const DestinationWaterBodyLogic = {
  title: 'Add a Destination Waterbody',
  type: 'object',
  properties: {
    manualWaterbody: ManualWaterbody
  },
  required: ['manualWaterbody'],
  dependencies: {
    manualWaterbody: {
      oneOf: [
        {
          properties: {
            manualWaterbody: {
              const: false
            },
            destinationWaterbody: DestinationWaterbody
          },
          required: ['destinationWaterbody']
        },
        {
          properties: {
            manualWaterbody: {
              const: true
            },
            manualWaterbodyName: ManualWaterbodyName,
            manualWaterbodyCity: ManualWaterbodyCity,
            manualWaterbodyCountry: ManualWaterbodyCountry,
            destinationMajorCity: DestinationMajorCity
          },
          required: ['manualWaterbodyName', 'manualWaterbodyCity', 'manualWaterbodyCountry', 'destinationMajorCity']
        }
      ]
    }
  }
};

export const DestinationToggles = {
  type: 'object',
  properties: {
    destinationUnknownCommercialStorageDropdown: DestinationUnknownCommercialStorageDropdown
  },
  dependencies: {
    destinationUnknownCommercialStorageDropdown: {
      oneOf: [
        {
          properties: {
            destinationUnknownCommercialStorageDropdown: {
              enum: ['Known Waterbody']
            },
            destinationWaterBody: {
              ...DestinationWaterBodyLogic
            }
          }
        },
        {
          properties: {
            destinationUnknownCommercialStorageDropdown: {
              enum: ['Unknown Destination Waterbody']
            },
            destinationMajorCity: {
              ...DestinationMajorCity
            }
          },
          required: ['destinationMajorCity']
        },
        {
          properties: {
            destinationUnknownCommercialStorageDropdown: {
              enum: ['Commercial Manufacturer as Destination Water Body']
            },
            destinationMajorCity: {
              ...DestinationMajorCity
            }
          },
          required: ['destinationMajorCity']
        },
        {
          properties: {
            destinationUnknownCommercialStorageDropdown: {
              enum: ['Destination Dry Storage']
            },
            destinationMajorCity: {
              ...DestinationMajorCity
            }
          },
          required: ['destinationUnknownCommercialStorageDropdown', 'destinationMajorCity']
        }
      ]
    }
  }
};
/* End of Destination */
/*** End of Journey Details Logic ***/

/*** Inspection Details /***/
export const K9InspectionLogic = {
  title: 'invisible',
  type: 'object',
  required: ['k9Inspection'],
  properties: {
    k9Inspection: K9Inspection
  },
  dependencies: {
    k9Inspection: {
      oneOf: [
        {
          properties: {
            k9Inspection: {
              enum: [false]
            }
          }
        },
        {
          properties: {
            k9Inspection: {
              enum: [true]
            },
            k9InspectionResults: K9InspectionResults
          },
          required: ['k9InspectionResults']
        }
      ]
    }
  }
};
/*** End of Inspection Details ***/

/*** Creating the Form Sections ***/
export const BasicInformation = {
  title: 'Basic Information',
  type: 'object',
  properties: {
    provinceAndTime: {
      title: 'invisible',
      type: 'object',
      properties: {
        province: Province,
        inspectionTime: InspectionTime
      },
      required: ['province', 'inspectionTime']
    },
    vehicleTypeInspectedCount: {
      title: 'invisible',
      type: 'object',
      properties: {
        nonMotorized: {
          title: 'Non-Motorized',
          ...IntStepper
        },
        simple: {
          title: 'Simple',
          ...IntStepper
        },
        complex: {
          title: 'Complex',
          ...IntStepper
        },
        veryComplex: {
          title: 'Very Complex',
          ...IntStepper
        }
      },
      required: ['nonMotorized', 'simple', 'complex', 'veryComplex']
    }
  },
  required: ['provinceAndTime', 'vehicleTypeInspectedCount']
};

export const WatercraftDetails = {
  title: 'Watercraft Details',
  type: 'object',
  properties: {
    watercraftDetails_BasicInformation: WatercraftDetails_BasicInformation,
    watercraftDetails_PreviousAISKnowledge: WatercraftDetails_PreviousAISKnowledge,
    watercraftDetails_PreviousInspection: WatercraftDetails_PreviousInspection
  },
  required: [
    'watercraftDetails_BasicInformation',
    'watercraftDetails_PreviousAISKnowledge',
    'watercraftDetails_PreviousInspection'
  ]
};

export const JourneyDetails = {
  title: 'Journey Details',
  type: 'object',
  properties: {
    previousJourneyDetails: {
      title: 'Previous Waterbody',
      type: 'object',
      properties: {
        previousToggles: {
          title: 'invisible',
          ...PreviousToggles
        }
      }
    },
    destinationJourneyDetails: {
      title: 'Destination Waterbody',
      type: 'object',
      properties: {
        destinationToggles: {
          title: 'invisible',
          ...DestinationToggles
        }
      }
    }
  }
};

export const InspectionDetails = {
  title: 'Inspection Details',
  type: 'object',
  properties: {
    aquaticPlantsFound: AquaticPlantsFound,
    marineMusselsFound: MarineMusselsFound,
    highRiskArea: HighRiskArea,
    dreissenidMusselsFoundPrevious: DreissenidMusselsFoundPrevious,
    k9Inspection: K9InspectionLogic
  },
  required: [
    'aquaticPlantsFound',
    'marineMusselsFound',
    'highRiskArea',
    'dreissenidMusselsFoundPrevious',
    'k9Inspection'
  ]
};

export const InspectionOutcomes = {
  title: 'invisible',
  type: 'object',
  properties: {
    watercraftRegistration: WatercraftRegistration,
    standingWaterPresentLogic: StandingWaterLogic,
    adultDreissenidMusselsFoundLogic: AdultDreissenidMusselsFoundLogic,
    otherInspectionFindings: OtherInspectionFindings,
    decontaminationPerformedLogic: DecontaminationPerformedLogic,
    decontaminationOrderIssuedLogic: DecontaminationOrderIssuedLogic,
    decontaminationAppendixB: DecontaminationAppendixB,
    sealIssuedLogic: SealIssuedLogic,
    quarantinePeriodIssued: QuarantinePeriodIssued
  },
  required: [
    'watercraftRegistration',
    'standingWaterPresentLogic',
    'adultDreissenidMusselsFoundLogic',
    'otherInspectionFindings',
    'decontaminationPerformedLogic',
    'decontaminationOrderIssuedLogic',
    'decontaminationAppendixB',
    'sealIssuedLogic',
    'quarantinePeriodIssued'
  ]
};

export const HighRiskAssessment = {
  title: 'High Risk Assessment Fields',
  type: 'object',
  properties: {
    highRiskFields: {
      title: 'High Risk Fields',
      type: 'string',
      enum: [
        'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found',
        'The watercraft is NOT Clean, Drain, Dry after full inspection and further action must be taken AND/OR a full inspection can not be completed.',
        'Adult Dreissenid Mussels Found',
        'Both - not Clean, Drain Dry and Adult Dreissenid Mussels Found'
      ],
      default: 'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found'
    }
  },
  required: ['highRiskFields'],
  allOf: [
    {
      if: {
        properties: {
          highRiskFields: {
            const: 'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found'
          }
        }
      },
      then: {
        properties: {}
      },
      else: {
        properties: {
          inspectionOutcomes: InspectionOutcomes
        },
        required: ['inspectionOutcomes']
      }
    }
  ]
};

/*** Creating the Passport Form Sections ***/
export const Passport_SimpleBasicInformation = {
  title: 'Basic Information',
  type: 'object',
  properties: {
    inspectionTime: InspectionTime,
    passportNumber: PassportNumber,
    launchedOutsideBC: LaunchedOutsideBC,
    k9Inspection: K9InspectionLogic,
    marineSpeciesFound: MarineSpeciesFound,
    aquaticPlantsFound: AquaticPlantsFound,
    decontaminationPerformed: DecontaminationPerformedLogic
  },
  required: [
    'inspectionTime',
    'passportNumber',
    'launchedOutsideBC',
    'k9Inspection',
    'marineSpeciesFound',
    'aquaticPlantsFound',
    'decontaminationPerformed'
  ]
};

export const Passport_BasicInformation = {
  title: 'Basic Information',
  type: 'object',
  properties: {
    provinceAndTime: {
      title: 'invisible',
      type: 'object',
      properties: {
        province: Province
      }
    },
    vehicleTypeInspectedCount: {
      title: 'invisible',
      type: 'object',
      properties: {
        nonMotorized: {
          title: 'Non-Motorized',
          ...IntStepper
        },
        simple: {
          title: 'Simple',
          ...IntStepper
        },
        complex: {
          title: 'Complex',
          ...IntStepper
        },
        veryComplex: {
          title: 'Very Complex',
          ...IntStepper
        }
      }
    }
  }
};

export const Passport_InspectionDetails = {
  title: 'Inspection Details',
  type: 'object',
  properties: {
    marineMusselsFound: MarineMusselsFound,
    highRiskArea: HighRiskArea,
    dreissenidMusselsFoundPrevious: DreissenidMusselsFoundPrevious
  },
  required: ['marineMusselsFound', 'highRiskArea', 'dreissenidMusselsFoundPrevious']
};

/*** Passport High Risk Assessment / Inspection Outcomes ***/
export const Passport_InspectionOutcomes = {
  title: 'invisible',
  type: 'object',
  properties: {
    watercraftRegistration: WatercraftRegistration,
    standingWaterPresentLogic: StandingWaterLogic,
    adultDreissenidMusselsFoundLogic: AdultDreissenidMusselsFoundLogic,
    otherInspectionFindings: OtherInspectionFindings,
    decontaminationOrderIssuedLogic: DecontaminationOrderIssuedLogic,
    decontaminationAppendixB: DecontaminationAppendixB,
    sealIssuedLogic: SealIssuedLogic,
    quarantinePeriodIssued: QuarantinePeriodIssued
  }
};

export const Passport_HighRiskAssessment = {
  title: 'High Risk Assessment Fields',
  type: 'object',
  properties: {
    highRiskFields: {
      title: 'High Risk Fields',
      type: 'string',
      enum: [
        'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found',
        'The watercraft is NOT Clean, Drain, Dry after full inspection and further action must be taken AND/OR a full inspection can not be completed.',
        'Adult Dreissenid Mussels Found',
        'Both - not Clean, Drain Dry and Adult Dreissenid Mussels Found'
      ],
      default: 'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found'
    }
  },
  allOf: [
    {
      if: {
        properties: {
          highRiskFields: {
            const: 'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found'
          }
        }
      },
      then: {
        properties: {}
      },
      else: {
        properties: {
          inspectionOutcomes: Passport_InspectionOutcomes
        },
        required: ['inspectionOutcomes']
      }
    }
  ]
};

/*** End of Passport High Risk Assessment / Inspection Outcomes ***/

/** @desc Inspection Subcomponent for Comments */
export const InspectionComments = {
  title: 'Comments',
  type: 'object',
  properties: {
    comment: {
      title: 'Inspection Comments',
      type: 'string'
    }
  }
};
