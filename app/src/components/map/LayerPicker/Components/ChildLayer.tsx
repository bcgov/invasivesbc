import React from 'react';
import {Checkbox, ClickAwayListener, Grid, IconButton, Tooltip, Typography} from '@mui/material';
import {getChild, updateChild} from '../Sorting/SortLayerOrder';
import {LayerModeDialog, ColourDialog} from './DialogBoxes';
import {MapRequestContext} from 'contexts/MapRequestsContext';
import InfoIcon from '@mui/icons-material/Info';
import {CONFIG} from "../../../../state/config";

export const ChildLayer = (props) => {
  const {child, parent} = props;
  const {layers, setLayers} = React.useContext(MapRequestContext);

  return (
    <Grid
      id={child.id}
      container
      style={{marginBottom: -5, marginTop: -5}}
      key={'layer' + child.id + Math.random()}
      direction="row"
      alignItems="center">
      &emsp;
      <Grid item xs={2} alignContent="center" justifyContent="center">
        <Checkbox
          id="child-checkbox"
          checked={getChild(layers, parent.id, child.id).enabled}
          name={child.name}
          onChange={() => {
            updateChild(layers, setLayers, parent.id, child.id, {
              enabled: !getChild(layers, parent.id, child.id).enabled
            });
          }}
        />
      </Grid>
      <InfoTooltip child={child}/>
      {CONFIG.DEBUG && <LayerModeDialog parent={parent} child={child}/>}
    </Grid>
  );
};

const InfoTooltip = (props: any) => {
  const {child} = props;
  const [open, setOpen] = React.useState(false);

  return (
    <Grid item xs={6}>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div>
          <Tooltip
            sx={{marginLeft: -7, zIndex: 9999}}
            PopperProps={{
              disablePortal: true
            }}
            disableFocusListener
            disableHoverListener
            open={open}
            onClose={() => setOpen(false)}
            placement="right"
            title={child.bcgw_code ? child.bcgw_code : child.layer_code}>
            <IconButton onClick={() => setOpen(!open)}>
              <InfoIcon/>
            </IconButton>
          </Tooltip>
          <Typography variant="caption">{child.name}</Typography>
        </div>
      </ClickAwayListener>
    </Grid>
  );
};
