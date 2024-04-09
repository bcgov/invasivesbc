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

/* Journey Details Sub Form */
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
	type: 'object',
	properties: {
		waterbody: {
			title: 'Add Previous Waterbody',
			type: 'string',
			enum: [
				'Snake River',
				'Columbia River',
				'Kootenay River'
			]
		},
		numberOfDaysOut: {
			title: 'Number of days out of waterbody',
			type: 'integer'
		}
	}
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
		previousUnknownCommercialStorage: {
			title: 'Unknown Previous Waterbody, Commercially Stored, or Dry Storage',
			type: 'boolean',
			enum: [
				true,
				false
			],
			default: false
		}
	},
	allOf: [
		{
			if: {
				properties: {
					previousUnknownCommercialStorage: {
						const: true
					}
				}
			},
			then: {
				properties: {
					previousUnknownCommercialStorageDropdown: {
						title: 'Previous Unknown Commercial Storage Dropdown',
						type: 'string',
						enum: [
							'Unknown Previous Waterbody',
							'Commercial Manufacturer as Previous Water Body',
							'Previous Dry Storage'
						]
					},
					previousMajorCity: {
						title: 'invisible',
						...PreviousMajorCity
					}
				}
			},
			else: {
				properties: {
					previousWaterBody: {
						title: 'Add a Previous Waterbody',
						...PreviousWaterBodyArray,
					}
				}
			}
		}
	]
}

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
				'Kootenay River'
			]
		}
	}
}

export const DestinationToggles = {
	type: 'object',
	properties: {
		destinationUnknownCommercialStorage: {
			title: 'Unknown Destination Waterbody, Commercially Stored, or Dry Storage',
			type: 'boolean',
			enum: [
				true,
				false
			],
			default: false
		}
	},
	allOf: [
		{
			if: {
				properties: {
					destinationUnknownCommercialStorage: {
						const: true
					}
				}
			},
			then: {
				properties: {
					destinationUnknownCommercialStorageDropdown: {
						title: 'Destination Unknown Commercial Storage Dropdown',
						type: 'string',
						enum: [
							'Unknown Destination Waterbody',
							'Commercial Manufacturer as Destination Water Body',
							'Destination Dry Storage'
						]
					},
					destinationMajorCity: {
						title: 'invisible',
						...DestinationMajorCity
					}
				}
			},
			else: {
				properties: {
					destinationWaterBody: {
						title: 'invisible',
						...DestinationWaterBody
					}
				}
			}
		}
	]
}

export const BasicInformation = {
	title: 'Basic Information',
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
		},
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
		PreviousJourneyDetails: {
			title: 'Previous Waterbody',
			type: 'object',
			properties: {
				previousToggles: {
					title: 'invisible',
					...PreviousToggles
				}
			}
		},
		DestinationJourneyDetails: {
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
}
