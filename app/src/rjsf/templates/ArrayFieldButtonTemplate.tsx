// Used in the two templates
import { Grid } from '@mui/material';
import IconButton from '../components/IconButton';
import React from 'react';
import { ArrayFieldItemButtonsTemplateProps, buttonId } from '@rjsf/utils';

const ArrayItemButtonTemplate = (props: ArrayFieldItemButtonsTemplateProps) => {
  const {
    disabled,
    readonly,
    hasMoveDown,
    hasMoveUp,
    hasRemove,
    fieldPathId,
    index,
    onMoveUpItem,
    onMoveDownItem,
    onRemoveItem
  } = props;

  const btnStyle = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold'
  };

  return (
    <Grid id={`buttons-${fieldPathId}`} container alignItems="center">
      <Grid>
        <IconButton
          id={buttonId(fieldPathId, 'moveUp')}
          icon="arrow-up"
          className="array-item-move-up"
          tabIndex={-1}
          style={btnStyle}
          disabled={disabled || readonly || !hasMoveUp}
          onClick={(e) => {
            onMoveUpItem(e);
          }}
        />
        <IconButton
          id={buttonId(fieldPathId, 'moveDown')}
          icon="arrow-down"
          tabIndex={-1}
          style={btnStyle}
          disabled={disabled || readonly || !hasMoveDown}
          onClick={(e) => onMoveDownItem(e)}
        />
        <IconButton
          id={buttonId(fieldPathId, 'remove')}
          icon="remove"
          tabIndex={-1}
          style={btnStyle}
          disabled={disabled || readonly || !hasRemove}
          onClick={(e) => onRemoveItem(e)}
        />
      </Grid>
    </Grid>
  );
};

export default ArrayItemButtonTemplate;
