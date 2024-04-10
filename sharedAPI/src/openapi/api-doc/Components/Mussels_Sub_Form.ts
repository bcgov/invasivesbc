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

/*** Watercraft Details ***/
export const WatercraftDetails_BasicInformation = {
	title: 'invisible',
	type: 'object',
	properties: {
		numberOfPeopleInParty: {
			type: 'integer',
			title: 'Number of People in the Party'
		},
		commerciallyHauled: {
			title: 'Commercially Hauled',
			...NullSwitch
		}
	}
};

export const WatercraftDetails_PreviousAISKnowledge = {
	title: 'invisible',
	type: 'object',
	properties: {
		previousAISKnowledge: {
			title: 'Previous AIS Knowledge',
			...NullSwitch
		}
	},
	allOf: [
		{
			if: {
				properties: {
					previousAISKnowledge: {
						const: false
					}
				}
			},
			then: {
				properties: {}
			},
			required: ['previousAISKnowledgeSource'],
			else: {
				properties: {
					previousAISKnowledgeSource: {
						title: 'Previous AIS Knowledge Source',
						type: 'string',
						enum: [
							'Brochure',
							'Highway Billboard Signs',
							'Highway Inspection Signs'
						]
					}
				}
			}
		}
	]
}

export const WatercraftDetails_PreviousInspection = {
	title: 'invisible',
	type: 'object',
	properties: {
		previousInspection: {
			title: 'Previous Inspection',
			...NullSwitch
		}
	},
	allOf: [
		{
			if: {
				properties: {
					previousInspection: {
						const: false
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					previousInspectionSource: {
						title: 'Previous Inspection Source',
						type: 'string',
						enum: [
							'Alabama',
							'Arkansas',
							'CBSA Referral - Abbostford/Huntington'
						]
					},
					previousInspectionDay: {
						title: 'Previous Inspection Days',
						type: 'string',
						enum: [
							'< 30 Days',
							'> 1 Year',
							'> 30 Days',
							'Same day'
						]
					}
				}
			},
			required: ['previousInspectionSource', 'previousInspectionDays']
		}
	]
};
/*** End of Watercraft Details ***/

/*** Journey Details Sub Form ***/
/* Previous */
export const PreviousMajorCity = {
	type: 'object',
	properties: {
		majorCity: {
			title: 'Add Previous Major City',
			type: 'string',
			enum: [
				'Calgary',
				'Edmonton',
				'Red Deer'
			]
		}
	}
};

export const PreviousWaterBody = {
	title: 'invisible',
	type: 'object',
	properties: {
		waterbody: {
			title: 'Add Previous Waterbody',
			type: 'string',
			enum: [
				'Snake River',
				'Columbia River',
				'Kootenay River',
				'Other'
			],
			default: ''
		},
		numberOfDaysOut: {
			title: 'Number of days out of waterbody',
			type: 'integer'
		}
	},
	allOf: [
		{
			if: {
				properties: {
					waterbody: {
						const: 'Other'
					}
				}
			},
			then: {
				properties: {
					previousMajorCity: {
						title: 'invisible',
						...PreviousMajorCity
					}
				}
			}
		}
	]
}

export const PreviousWaterBodyArray = {
	type: 'array',
	items: {
		...PreviousWaterBody
	}
}

export const PreviousToggles = {
	type: 'object',
	properties: {
		previousUnknownCommercialStorageDropdown: {
			title: 'Previous Unknown Commercial Storage Dropdown',
			type: 'string',
			enum: [
				'Known Waterbody',
				'Unknown Previous Waterbody',
				'Commercial Manufacturer as Previous Water Body',
				'Previous Dry Storage'
			]
		}
	},
	allOf: [
		{
			if: {
				properties: {
					previousUnknownCommercialStorageDropdown: {
						const: 'Known Waterbody'
					}
				}
			},
			then: {
				properties: {
					previousWaterBody: {
						title: 'Add a Previous Waterbody',
						...PreviousWaterBodyArray,
					}
				}
			},
			else: {
				properties: {
					previousMajorCity: {
						title: 'invisible',
						...PreviousMajorCity
					}
				}
			}
		}
	]
}
/* End of Previous */

/* Destination */
export const DestinationMajorCity = {
	type: 'object',
	properties: {
		majorCity: {
			title: 'Add Destination Major City',
			type: 'string',
			enum: [
				'Calgary',
				'Edmonton',
				'Red Deer'
			]
		}
	}
};

export const DestinationWaterBody = {
	type: 'object',
	properties: {
		waterbody: {
			title: 'Add Destination Waterbody',
			type: 'string',
			enum: [
				'Snake River',
				'Columbia River',
				'Kootenay River',
				'Other'
			],
			default: ''
		}
	},
	allOf: [
		{
			if: {
				properties: {
					waterbody: {
						const: 'Other'
					}
				}
			},
			then: {
				properties: {
					destinationMajorCity: {
						title: 'invisible',
						...DestinationMajorCity
					}
				}
			}
		}
	]
}

export const DestinationToggles = {
	type: 'object',
	properties: {
		destinationUnknownCommercialStorageDropdown: {
			title: 'Destination Unknown Commercial Storage Dropdown',
			type: 'string',
			enum: [
				'Known Waterbody',
				'Unknown Destination Waterbody',
				'Commercial Manufacturer as Destination Water Body',
				'Destination Dry Storage'
			]
		}
	},
	allOf: [
		{
			if: {
				properties: {
					destinationUnknownCommercialStorageDropdown: {
						const: 'Known Waterbody'
					}
				}
			},
			then: {
				properties: {
					destinationWaterBody: {
						title: 'Add a Destination Waterbody',
						...DestinationWaterBody
					}
				}
			},
			else: {
				properties: {
					destinationMajorCity: {
						title: 'invisible',
						...DestinationMajorCity
					}
				}
			}
		}
	]
}
/* End of Destination */
/*** End of Journey Details ***/

/*** Inspection Details /***/
export const k9Inspection = {
	title: 'invisible',
	type: 'object',
	properties: {
		k9Inspection: {
			title: 'K9 Inspection',
			...NullSwitch
		}
	},
	allOf: [
		{
			if: {
				properties: {
					k9Inspection: {
						const: false
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					k9InspectionResults: {
						title: 'K9 Inspection Result',
						type: 'string',
						enum: [
							'K9 detected/indicated',
							'K9 did not indicate'
						]
					}
				}
			},
			required: ['k9InspectionResults'],
		}
	]
};
/*** End of Inspection Details ***/

/*** High Risk Assessment / Inspection Outcomes ***/

/* Adult Dreissenid Mussels Found */
export const AdultDreissenidMusselsFoundLocation = {
	title: 'invisible',
	type: 'object',
	properties: {
		adultDreissenidMusselsFoundLocation: {
			title: 'Add a location',
			type: 'string',
			enum: [
				'Engine',
				'Hull',
				'Gimbal'
			]
		}
	}
}

export const AdultDreissenidMusselsFoundLocationArray = {
	type: 'array',
	items: {
		...AdultDreissenidMusselsFoundLocation
	}
}

export const AdultDreissenidMusselsFound = {
	type: 'object',
	title: 'invisible',
	properties: {
		adultDreissenidMusselsFound: {
			title: 'Adult Dreissenid Mussels Found',
			...NullSwitch
		}
	},
	allOf: [
		{
			if: {
				properties: {
					adultDreissenidMusselsFound: {
						const: false
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					adultDreissenidMusselsFoundLocation: {
						title: 'Add a Location where Mussels were found',
						...AdultDreissenidMusselsFoundLocationArray,
					}
				}
			},
			required: ['adultDreissenidMusselsFoundLocation']
		}
	]
};
/* End of Adult Dreissenid Mussels Found */

/* Standing Water Location */
export const StandingWaterLocation = {
	title: 'invisible',
	type: 'object',
	properties: {
		standingWaterLocation: {
			title: 'Add a Location',
			type: 'string',
			enum: [
				'Engine',
				'Hull',
				'Gimbal'
			]
		}
	}
}

export const StandingWaterLocationArray = {
	type: 'array',
	items: {
		...StandingWaterLocation
	}
}

export const StandingWaterPresent = {
	type: 'object',
	title: 'invisible',
	properties: {
		standingWaterPresent: {
			title: 'Standing Water Present',
			...NullSwitch
		}
	},
	allOf: [
		{
			if: {
				properties: {
					standingWaterPresent: {
						const: false
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					standingWaterLocation: {
						title: 'Add a Standing Water Location',
						...StandingWaterLocationArray,
					}
				}
			},
			required: ['standingWaterLocation']
		}
	]
};
/* End of Standing Water Location */

/* Decontamination Order Performed */
export const DecontaminationPerformed = {
	type: 'object',
	title: 'invisible',
	properties: {
		decontaminationPerformed: {
			title: 'Decontamination Performed',
			...NullSwitch
		}
	},
	allOf: [
		{
			if: {
				properties: {
					decontaminationPerformed: {
						const: false
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					decontaminationReference: {
						title: 'Record of Decontamination number',
						type: 'string'
					}
				}
			},
			required: ['decontaminationPerformed']
		}
	]
};
/* End of Decontamination Order Performed */

/* Decontamination Order Issued */
export const DecontaminationOrderIssued = {
	type: 'object',
	title: 'invisible',
	properties: {
		decontaminationOrderIssued: {
			title: 'Decontamination Order Issued',
			...NullSwitch
		}
	},
	allOf: [
		{
			if: {
				properties: {
					decontaminationOrderIssued: {
						const: false
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					decontaminationOrderNumber: {
						title: 'Decontamination order number',
						type: 'string'
					},
					decontaminationOrderReason: {
						title: 'Reason for issuing decontamination order',
						type: 'string',
						enum: [
							'Inspection/decontamination could not be performed',
							'No decontamination - non-compliant refusing decontamination',
							'No decontamination - pressure washer not working',
							'No decontamination - watercraft too complex',
							'Partial decontamination only'
						]
					}
				}
			},
			required: ['decontaminationOrderIssued']
		}
	]
};
/* End of Decontamination Order Issued */

export const DecontaminationAppendixB = {
	title: "Appendix B completed and served",
	...NullSwitch
};

/* Seal Issued */
export const SealIssued = {
	type: 'object',
	title: 'invisible',
	properties: {
		sealIssued: {
			title: 'Seal Issued',
			...NullSwitch
		}
	},
	allOf: [
		{
			if: {
				properties: {
					sealIssued: {
						const: false
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					sealNumber: {
						title: 'Seal #',
						type: 'string'
					}
				}
			},
			required: ['sealIssued']
		}
	]
};
/* End of Seal Issued */


export const InspectionOutcomes = {
	title: 'invisible',
	type: 'object',
	properties: {
		standingWaterPresent: {
			...StandingWaterPresent
		},
		adultDreissenidMusselsFound: {
			...AdultDreissenidMusselsFound
		},
		otherInspectionFindings: {
			title: 'Other Inspection Findings',
			type: 'string',
			enum: [
				'Aquatic plants found',
				'Dirty hull or bilge',
				'Live bait',
				'Live fish',
			]
		},
		decontaminationPerformed: {
			...DecontaminationPerformed
		},
		decontaminationOrderIssued: {
			...DecontaminationOrderIssued
		},
		decontaminationAppendixB: {
			...DecontaminationAppendixB
		},
		sealIssued: {
			...SealIssued
		}
	}
}
/* End of High Risk Assessment /Inspection Outcomes */

export const BasicInformation = {
	title: 'Basic Information',
	type: 'object',
	properties: {
		provinceAndTime: {
			title: 'invisible',
			type: 'object',
			properties: {
				province: {
					title: 'Province / State',
					type: 'string',
					enum: [
						'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
						'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
						'Northwest Territories', 'Nunavut', 'Yukon', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
						'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
						'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
						'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
						'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
						'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
						'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
						'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
						'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
						'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
					],
					default: 'BC'
				},
				inspection_time: {
					title: 'Inspection Time',
					type: 'string',
					format: 'date-time',
				}
			}
		},
		vehicleTypeInspectedCount: {
			title: 'invisible',
			type: 'object',
			properties: {
				non_motorized: {
					type: 'integer',
					title: 'Non Motorized'
				},
				motorized: {
					type: 'integer',
					title: 'Motorized'
				},
				simple: {
					type: 'integer',
					title: 'Simple'
				},
				complex: {
					type: 'integer',
					title: 'Complex'
				}
			}
		}
	}
};

export const WatercraftDetails = {
	title: 'Watercraft Details',
	type: 'object',
	properties: {
		WatercraftDetails_BasicInformation: {
			...WatercraftDetails_BasicInformation
		},
		WatercraftDetails_PreviousAISKnowledge: {
			...WatercraftDetails_PreviousAISKnowledge
		},
		WatercraftDetails_PreviousInspection: {
			...WatercraftDetails_PreviousInspection
		}
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
	properties: {
		aquaticPlantsFound: {
			title: 'Aquatic plants found',
			...NullSwitch
		},
		marineMusselsFound: {
			title: 'Marine Mussels Found',
			...NullSwitch
		},
		highRiskArea: {
			title: 'Watercraft coming from a high risk area for whirling disease',
			...NullSwitch
		},
		dreissenidMusselsFoundPrevious: {
			title: 'Dreissenid mussels found during inspection and FULL decontamination already completed/determined to be CDD',
			...NullSwitch
		},
		k9Inspection: {
			...k9Inspection
		},
	}
};

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
					highRisk: {
						const: 'Watercraft is Clean, Drain, Dry / Adult Dreissenid Mussels NOT found'
					}
				}
			},
			then: {
				properties: {}
			},
			else: {
				properties: {
					InspectionOutcomes: {
						title: 'Inspection Outcomes',
						...InspectionOutcomes
					}
				}
			},
		}
	]
};

