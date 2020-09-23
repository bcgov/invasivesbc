import { Container } from '@material-ui/core';
import FormContainer from 'components/form/FormContainer';
import React from 'react';
import { treatment_uischema } from 'rjsf/uiSchema';

const schema = {
  type: 'object',
  required: [
    'treatment_id',
    'workflow_id',
    'treatment_date',
    'treatment time',
    'applicator_first_name',
    'applicator_last_name',
    'species_id',
    'treatment_type',
    'species_agency_code',
    'jurisdiction_code'
  ],
  properties: {
    treatment_id: {
      type: 'number',
      title: 'ID'
    },
    workflow_id: {
      type: 'number',
      title: 'Workflow ID'
    },
    treatment_date: {
      type: 'string',
      title: 'Date'
    },
    treatment_time: {
      type: 'string',
      title: 'Time'
    },
    applicator_first_name: {
      type: 'string',
      title: 'First Name'
    },
    applicator_last_name: {
      type: 'string',
      title: 'Last Name'
    },
    species_id: {
      type: 'string',
      title: 'Species'
    },
    treatment_type: {
      type: 'string',
      title: 'Type'
    },
    species_agency_code: {
      type: 'string',
      title: 'Agency'
    },
    jurisdiction_code: {
      type: 'string',
      title: 'Jurisdiction'
    },
    negative_obs_ind: {
      type: 'boolean',
      title: 'Negative treatment'
    },
    subType: {
      oneOf: [
        {
          $ref: '#/definitions/Treatment_ChemicalPlant'
        },
        {
          $ref: '#/definitions/Herbicide_Treatment'
        },
        {
          $ref: '#/definitions/Treatment_ChemicalAnimal'
        },
        {
          $ref: '#/definitions/Treatment_MechanicalPlant'
        },
        {
          $ref: '#/definitions/Treatment_BiologicalPlant'
        },
        {
          $ref: '#/definitions/Treatment_ApplicatorBiological'
        }
      ]
    }
  },
  definitions: {
    Treatment_ChemicalPlant: {
      description: 'Chemical Plant Treatment.',
      type: 'object',
      properties: {
        workflow_id: {
          type: 'number',
          title: 'ID'
        },
        chemical_treatment_id: {
          type: 'number',
          title: 'Treatment'
        },
        treatment_date: {
          type: 'string',
          title: 'Date'
        },
        treatment_time: {
          type: 'string',
          title: 'Time'
        },
        species_id: {
          type: 'string',
          title: 'Species'
        },
        species_agency_code: {
          type: 'string',
          title: 'Agency'
        },
        jurisdiction_code: {
          type: 'string',
          title: 'Jurisdiction'
        },
        primary_applicator_employee_code: {
          type: 'string',
          title: 'Primary Employee'
        },
        secondary_applicator_employee_code: {
          type: 'string',
          title: 'Secondary Employee'
        },
        pesticide_employer_code: {
          type: 'string',
          title: 'Employer'
        },
        project_management_plan_PMP: {
          type: 'string',
          title: 'PMP'
        },
        pesticide_use_permit_PUP: {
          type: 'string',
          title: 'PUP'
        },
        primary_paper_file_id: {
          type: 'string',
          title: 'Primary File'
        },
        secondary_paper_file_id: {
          type: 'string',
          title: 'Secondary File'
        },
        chemical_treatment_method: {
          type: 'string',
          title: 'Treatment Method'
        },
        temperature: {
          type: 'number',
          title: 'Temperature'
        },
        wind_speed: {
          type: 'string',
          title: 'Wind Speed'
        },
        humidity: {
          type: 'number',
          title: 'Humidity'
        },
        mix_delivery_rate: {
          type: 'number',
          title: 'Mix Delivery Rate'
        },
        application_rate: {
          type: 'number',
          title: 'Application Rate'
        },
        area_treated: {
          type: 'number',
          title: 'Area'
        },
        herbicide: {
          type: 'array',
          title: 'Herbicide Treatment',
          items: {
            $ref: '#/definitions/Herbicide_Treatment'
          }
        },
        general_comment: {
          type: 'string',
          title: 'Description',
          maximum: 300
        },
        access_description: {
          type: 'string',
          title: 'Access Description',
          maximum: 300
        }
      }
    },
    Herbicide_Treatment: {
      description: 'List of Herbicides',
      type: 'object',
      required: ['herbicide_id', 'chemical_treatment_id'],
      properties: {
        herbicide_id: {
          type: 'string',
          title: 'ID'
        },
        chemical_treatment_id: {
          type: 'number',
          title: 'Treatment'
        },
        amount_of_herbicide: {
          type: 'number',
          title: 'Amount'
        },
        description: {
          type: 'string',
          title: 'description'
        }
      }
    },
    Treatment_ChemicalAnimal: {
      description: 'Chemical Animal Treatment.',
      type: 'object',
      properties: {
        workflow_id: {
          type: 'number',
          title: 'ID'
        },
        chemical_treatment_id: {
          type: 'number',
          title: 'Treatment'
        },
        treatment_date: {
          type: 'string',
          title: 'Date'
        },
        treatment_time: {
          type: 'string',
          title: 'Time'
        },
        species_animal_id: {
          type: 'string',
          title: 'Species'
        },
        species_agency_code: {
          type: 'string',
          title: 'Agency'
        },
        jurisdiction_code: {
          type: 'string'
        },
        treatment_method: {
          type: 'string',
          title: 'Jurisdiction'
        },
        general_comment: {
          type: 'string',
          title: 'Description',
          maximum: 300
        },
        access_description: {
          type: 'string',
          title: 'Access Description',
          maximum: 300
        }
      }
    },
    Treatment_MechanicalPlant: {
      description: 'Mechanical Plant Treatment.',
      type: 'object',
      properties: {
        workflow_id: {
          type: 'number',
          title: 'ID'
        },
        mechanical_treatment_id: {
          type: 'number',
          title: 'Treatment'
        },
        treatment_date: {
          type: 'string',
          title: 'Date'
        },
        treatment_time: {
          type: 'string',
          title: 'Time'
        },
        species_animal_id: {
          type: 'string',
          title: 'Species'
        },
        species_agency_code: {
          type: 'string',
          title: 'Agency'
        },
        jurisdiction_code: {
          type: 'string',
          title: 'Jurisdiction'
        },
        treatment_method: {
          type: 'string',
          title: 'Method'
        },
        general_comment: {
          type: 'string',
          title: 'Description',
          maximum: 300
        },
        access_description: {
          type: 'string',
          title: 'Access Description',
          maximum: 300
        }
      }
    },
    Treatment_BiologicalPlant: {
      description: 'Biological Plant Treatment.',
      type: 'object',
      properties: {
        workflow_id: {
          type: 'number',
          title: 'ID'
        },
        biological_treatment_id: {
          type: 'number',
          title: 'Treatment'
        },
        treatment_date: {
          type: 'string',
          title: 'Date'
        },
        treatment_time: {
          type: 'string',
          title: 'Time'
        },
        applicator: {
          type: 'array',
          title: 'Applicator',
          items: {
            $ref: '#/definitions/Treatment_ApplicatorBiological'
          }
        },
        treatment_contractor: {
          type: 'string',
          title: 'Contractor'
        },
        species_id: {
          type: 'string',
          title: 'Species'
        },
        species_agency_code: {
          type: 'string',
          title: 'Agency'
        },
        jurisdiction_code: {
          type: 'string',
          title: 'Jurisdiction'
        },
        general_comment: {
          type: 'string',
          title: 'Description',
          maximum: 300
        },
        access_description: {
          type: 'string',
          title: 'Access Description',
          maximum: 300
        }
      }
    },
    Treatment_ApplicatorBiological: {
      description: 'Biological Treament Applicators',
      type: 'object',
      required: ['biological_treatment_id'],
      properties: {
        biological_treatment_id: {
          type: 'number',
          title: 'Treatment'
        },
        applicator_first_name: {
          type: 'string',
          title: 'First Name'
        },
        applicator_last_name: {
          type: 'string',
          title: 'Last Name'
        }
      }
    }
  }
};

interface ITreatmentProps {
  classes?: any;
  activity: any;
}

const Treatment: React.FC<ITreatmentProps> = (props) => {
  return (
    <Container className={props.classes.container}>
      <FormContainer {...props} schema={schema} uiSchema={treatment_uischema} />
    </Container>
  );
};

export default Treatment;
