import { NotListedLocation } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

interface ToggleClickDetailsButtonProps {
  clickDetailsEnabled: boolean;
  setClickDetailsEnabled(value: boolean): void;
}

const useStyles = makeStyles((theme) => ({
  customHoverFocus: {
    backgroundColor: 'white',
    '&:hover, &.Mui-focusVisible': { backgroundColor: 'skyblue' }
  },
  selected: {
    backgroundColor: '#2196f3',
    color: 'white'
  },
  notSelected: {
    backgroundColor: 'white',
    color: 'black'
  }
}));

/**
 * ToggleClickDetailsButton
 * @description Component to handle the functionality of the click listener toggle
 * @returns {void}
 */
export function ToggleClickDetailsButton(props: ToggleClickDetailsButtonProps) {
  const { clickDetailsEnabled, setClickDetailsEnabled } = props;
  const classes = useStyles(); // Get the classes from the context

  return (
    <div
      className="leaflet-bottom leaflet-right"
      style={{
        left: '0px',
        bottom: '220px'
      }}>
      <Tooltip
        title={clickDetailsEnabled ? 'Disable Location Details' : 'Enable Location Details'}
        placement="right-start">
        <IconButton
          onClick={() => {
            setClickDetailsEnabled(!clickDetailsEnabled);
          }}
          className={
            'leaflet-control-zoom leaflet-bar leaflet-control ' +
            classes.customHoverFocus +
            ' ' +
            (clickDetailsEnabled ? classes.selected : classes.notSelected)
          }
          sx={{ color: '#000' }}>
          <NotListedLocation />
        </IconButton>
      </Tooltip>
    </div>
  );
}
