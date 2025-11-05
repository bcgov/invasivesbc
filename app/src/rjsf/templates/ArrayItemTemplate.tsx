// Used in the two templates
import { Box, Grid, Paper } from '@mui/material';
import React from 'react';
import { ArrayFieldItemTemplateProps, getTemplate, getUiOptions } from '@rjsf/utils';

const ArrayItemTemplate = (props: ArrayFieldItemTemplateProps) => {
  const { children, buttonsProps, hasToolbar, uiSchema, registry } = props;
  const uiOptions = getUiOptions(uiSchema);
  const ArrayFieldItemButtonsTemplate = getTemplate<'ArrayFieldItemButtonsTemplate'>(
    'ArrayFieldItemButtonsTemplate',
    registry,
    uiOptions
  );

  return (
    <Grid size={{ xs: 12 }}>
      <Paper elevation={1} style={{ padding: '4px' }}>
        {children}
      </Paper>
      {hasToolbar && (
        <Grid>
          <ArrayFieldItemButtonsTemplate {...buttonsProps} />
        </Grid>
      )}
    </Grid>
  );
};

export default ArrayItemTemplate;
