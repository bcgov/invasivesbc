import { Box, Step, StepLabel, Stepper, Typography } from '@mui/material';
import React from 'react';

interface IStepperComponentProps {
  activeStep: number;
  steps: any;
  stepContent: string;
}

const StepperComponent: React.FC<IStepperComponentProps> = (props) => {
  const { activeStep, steps, stepContent } = props;

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="horizontal" style={{ backgroundColor: 'transparent' }}>
        {steps.map((step) => (
          <Step key={step}>
            <StepLabel>
              <Typography variant="h4">{step}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box mt={3}>
        <Typography style={{ textAlign: 'center' }}>{stepContent}</Typography>
      </Box>
    </Box>
  );
};

export default StepperComponent;
