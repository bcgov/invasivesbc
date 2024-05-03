import { title } from "process";

/*** Common Fields ***/
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

export const MarineSpeciesFound = {
	title: 'Marine Species Found',
	...NullSwitch
};

/* Basic Information */
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
	'x-tooltip-text':
		'Province / state name'
};


export const InspectionTime = {
	title: 'Inspection Time',
	type: 'string',
	format: 'date-time',
	'x-tooltip-text': 'Time inspection occurred'
};

export const  VehicleNonMotorized = {
	type: 'integer',
	title: 'Non Motorized'
};

export const  VehicleVeryComplex = {
	type: 'integer',
	title: 'Very Complex'
};

export const  VehicleSimple = {
	type: 'integer',
	title: 'Simple'
};

export const  VehicleComplex = {
	type: 'integer',
	title: 'Complex'
};
/* End of Basic Information */

/* Watercraft Details */
export const NumberOfPeopleInParty = {
	type: 'integer',
	title: 'Number of People in the Party'
};

export const CommerciallyHauled = {
	title: 'Commercially Hauled',
	...NullSwitch,
};

export const PreviousAISKnowledge = {
	title: 'Previous AIS Knowledge',
	...NullSwitch,
};

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
	'x-tooltip-text':
		'Source of Previous AIS Knowledge or Clean, Drain, Dry'
}

export const PreviousInspection = {
	title: 'Previous inspection and/or agency notification',
	...NullSwitch
};

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
	'x-tooltip-text':
		'Previous Inspection and/or Agency Notification Source'
}

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
	'x-tooltip-text':
		'Previous Inspection and/or Agency Notification Number of Days'
};
/* End of Watercraft Details */

/* Journey Details */
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
	'x-tooltip-text':
		'Major city name'
};

export const ManualWaterbody = {
	title: 'Manually Enter a Waterbody',
	type: 'boolean',
	default: false
};

export const ManualWaterbodyName = {
	title: 'Manually enter the waterbody name',
	type: 'string'
};

export const ManualWaterbodyCity = {
	title: 'Manually enter the city for the waterbody',
	type: 'string'
};

export const ManualWaterbodyCountry = {
	title: 'Manually enter the country for the waterbody',
	type: 'string'
};

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
	'x-tooltip-text':
		'Waterbody name'
};

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

export const PreviousMajorCity = {
	...MajorCity
};

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
	'x-tooltip-text':
		'Waterbody name'
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

/* Inspection Details */
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
	enum: [
		'K9 detected/indicated',
		'K9 did not indicate'
	]
};
/*	End of Inspection Details */

/* High Risk */
export const WatercraftRegistration = {
	title: 'Boat registration # (if applicable)',
	type: 'string'
}

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
	'x-tooltip-text':
		'Location on watercraft where standing water / mussels were found'
}

export const AdultDreissenidMusselsLocationArray = {
	title: 'Adult Dreissenid Mussels Location',
	type: 'array',
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
	dependencies: {
		adultDreissenidMusselsFound: {
			oneOf: [
				{
					properties: {
						adultDreissenidMusselsFound: {
							enum: [ false ]
						}
					}
				},
				{
					properties: {
						adultDreissenidMusselsFound: {
							enum: [ true ]
						},
						adultDreissenidMusselsLocation: AdultDreissenidMusselsLocationArray
					}
				}
			]
		}
	}
}

export const StandingWaterPresent = {
	title: 'Standing Water Present',
	...NullSwitch
};

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
	'x-tooltip-text':
		'Location on watercraft where standing water / mussels were found'
}

export const StandingWaterLocationArray = {
	title: 'Standing Water Location',
	type: 'array',
	items: {
		...StandingWaterLocation
	}
};

export const StandingWaterLogic = {
	type: 'object',
	title: 'invisible',
	properties: {
		standingWaterPresent: StandingWaterPresent
	},
	dependencies: {
		standingWaterPresent: {
			oneOf: [
				{
					properties: {
						standingWaterPresent: {
							enum: [ false ]
						}
					}
				},
				{
					properties: {
						standingWaterPresent: {
							enum: [ true ]
						},
						standingWaterLocation: StandingWaterLocationArray
					}
				}
			]
		}
	}
}

export const OtherInspectionFindings = {
	title: 'Other Inspection Findings',
	type: 'string',
	enum: [
		'Aquatic plants found',
		'Dirty hull or bilge',
		'Live bait',
		'Live fish',
	]
};

export const DecontaminationPerformed = {
	title: 'Decontamination Performed',
	...NullSwitch
};

export const DecontaminationReference = {
	title: 'Record of Decontamination number',
	type: 'string'
};

export const DecontaminationPerformedLogic = {
	type: 'object',
	title: 'invisible',
	required: ['decontaminationPerformed'],
	properties: {
		decontaminationPerformed: DecontaminationPerformed,
	},
	dependencies: {
		decontaminationPerformed: {
			oneOf: [
				{
					properties: {
						decontaminationPerformed: {
							enum: [ false ]
						}
					}
				},
				{
					properties: {
						decontaminationPerformed: {
							enum: [ true ]
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
	'x-tooltip-text':
		'Reason for issuing decontamination order'
}

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
							enum: [ false ]
						}
					}
				},
				{
					properties: {
						decontaminationOrderIssued: {
							enum: [ true ]
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
	title: "Appendix B completed and served",
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
							enum: [ false ]
						}
					}
				},
				{
					properties: {
						sealIssued: {
							enum: [ true ]
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
/* End of High Risk */
/*** End of all Form Fields ***/

/*** Watercraft Details Section ***/
export const WatercraftDetails_BasicInformation = {
	title: 'invisible',
	type: 'object',
	required: ['numberOfPeopleInParty', 'commerciallyHauled'],
	properties: {
		numberOfPeopleInParty: NumberOfPeopleInParty,
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
}
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
						previousMajorCity: {
							...PreviousMajorCity
						}
					}
				}
			]
		}
	},
}

export const PreviousWaterBodyArray = {
	type: 'array',
	items: {
		...PreviousWaterBodyLogic
	}
}

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
							...PreviousWaterBodyArray,
						}
					}
				},
				{
					properties: {
						previousUnknownCommercialStorageDropdown: {
							enum: ['Unknown Previous Waterbody']
						},
						previousMajorCity: PreviousMajorCity
					}
				},
				{
					properties: {
						previousUnknownCommercialStorageDropdown: {
							enum: ['Commercial Manufacturer as Previous Water Body']
						},
						previousMajorCity: PreviousMajorCity
					}
				},
				{
					properties: {
						previousUnknownCommercialStorageDropdown: {
							enum: ['Previous Dry Storage']
						},
						previousMajorCity: PreviousMajorCity
					}
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
					}
				}
			]
		}
	},
}

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
							title: 'Add Major City',
							...DestinationMajorCity
						}
					}
				},
				{
					properties: {
						destinationUnknownCommercialStorageDropdown: {
							enum: ['Commercial Manufacturer as Destination Water Body']
						},
						destinationMajorCity: DestinationMajorCity
					}
				},
				{
					properties: {
						destinationUnknownCommercialStorageDropdown: {
							enum: ['Destination Dry Storage']
						},
						destinationMajorCity: DestinationMajorCity
					}
				}
			]
		}
	},
}
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
							enum: [ false ]
						}
					}
				},
				{
					properties: {
						k9Inspection: {
							enum: [ true ]
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
				inspection_time: InspectionTime
			}
		},
		vehicleTypeInspectedCount: {
			title: 'invisible',
			type: 'object',
			properties: {
				non_motorized: VehicleNonMotorized,
				simple: VehicleSimple,
				complex: VehicleComplex,
				motorized: VehicleVeryComplex
			}
		},
	}
};

export const WatercraftDetails = {
	title: 'Watercraft Details',
	type: 'object',
	properties: {
		WatercraftDetails_BasicInformation: WatercraftDetails_BasicInformation,
		WatercraftDetails_PreviousAISKnowledge: WatercraftDetails_PreviousAISKnowledge,
		WatercraftDetails_PreviousInspection: WatercraftDetails_PreviousInspection
	}
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
	required: ['dreissenidMusselsFoundPrevious'],
	properties: {
		aquaticPlantsFound: AquaticPlantsFound,
		marineMusselsFound: MarineMusselsFound,
		highRiskArea: HighRiskArea,
		dreissenidMusselsFoundPrevious: DreissenidMusselsFoundPrevious,
		k9Inspection: K9InspectionLogic
	}
};

export const InspectionOutcomes = {
	title: 'invisible',
	type: 'object',
	required: ['decontaminationAppendixB', 'quarantinePeriodIssued'],
	properties: {
		watercraftRegistration: WatercraftRegistration,
		standingWaterPresentLogic: StandingWaterLogic,
		adultDreissenidMusselsFoundLogic: AdultDreissenidMusselsFoundLogic,
		otherInspectionFindings: OtherInspectionFindings,
		decontaminationPerformedLogic: DecontaminationPerformedLogic,
		decontaminationOrderIssuedLogic: DecontaminationOrderIssuedLogic,
		decontaminationAppendixB: DecontaminationAppendixB,
		sealIssuedLogic: SealIssuedLogic,
		quarantinePeriodIssued: QuarantinePeriodIssued,
	}
}

export const HighRiskAssessment = {
	title: 'High Risk Assessment Fields',
	type: 'object',
	properties: {
		'High Risk Fields': {
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
					'High Risk Fields': {
						const: 'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found'
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					InspectionOutcomes: InspectionOutcomes
				}
			},
		}
	]
};

/*** Creating the Passport Form Sections ***/
export const Passport_SimpleBasicInformation = {
	title: 'Basic Information',
	type: 'object',
	properties: {
		inspection_time: InspectionTime,
		launchedOutsideBC: LaunchedOutsideBC,
		k9Inspection: K9InspectionLogic,
		marineSpeciesFound: MarineSpeciesFound,
		aquaticPlantsFound: AquaticPlantsFound,
		decontaminationPerformed: DecontaminationPerformedLogic,
	}
};

export const Passport_BasicInformation = {
	title: 'Basic Information',
	type: 'object',
	properties: {
		provinceAndTime: {
			title: 'invisible',
			type: 'object',
			properties: {
				province: Province,
			}
		},
		vehicleTypeInspectedCount: {
			title: 'invisible',
			type: 'object',
			properties: {
				non_motorized: VehicleNonMotorized,
				simple: VehicleSimple,
				complex: VehicleComplex,
				very_complex: VehicleVeryComplex,
			}
		}
	}
};

export const Passport_InspectionDetails = {
	title: 'Inspection Details',
	type: 'object',
	required: ['dreissenidMusselsFoundPrevious'],
	properties: {
		marineMusselsFound: MarineMusselsFound,
		highRiskArea: HighRiskArea,
		dreissenidMusselsFoundPrevious: DreissenidMusselsFoundPrevious,
	}
};

/*** Passport High Risk Assessment / Inspection Outcomes ***/
export const Passport_InspectionOutcomes = {
	title: 'invisible',
	type: 'object',
	required: ['decontaminationAppendixB', 'quarantinePeriodIssued'],
	properties: {
		watercraftRegistration: WatercraftRegistration,
		standingWaterPresentLogic: StandingWaterLogic,
		adultDreissenidMusselsFoundLogic: AdultDreissenidMusselsFoundLogic,
		otherInspectionFindings: OtherInspectionFindings,
		decontaminationOrderIssuedLogic: DecontaminationOrderIssuedLogic,
		decontaminationAppendixB: DecontaminationAppendixB,
		sealIssuedLogic: SealIssuedLogic,
		quarantinePeriodIssued: QuarantinePeriodIssued,
	}
}

export const Passport_HighRiskAssessment = {
	title: 'High Risk Assessment Fields',
	type: 'object',
	properties: {
		'High Risk Fields': {
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
					'High Risk Fields': {
						const: 'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found'
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					InspectionOutcomes: Passport_InspectionOutcomes
				}
			}
		}
	]
};
