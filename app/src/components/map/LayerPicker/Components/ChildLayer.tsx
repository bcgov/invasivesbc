import React from 'react';
import { Checkbox, Grid, Typography } from '@mui/material';
import { getChild, updateChild } from '../Sorting/SortLayerOrder';
import { LayerModeDialog, ColourDialog } from './DialogBoxes';
import { MapRequestContext } from 'contexts/MapRequestsContext';

export const ChildLayer = (props) => {
  const { child, parent } = props;
  const { layers, setLayers } = React.useContext(MapRequestContext);

  return (
    <Grid
      id={child.id}
      container
      style={{ marginBottom: -5, marginTop: -5 }}
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
      <Grid item xs={6}>
        <Typography variant="caption">{child.name}</Typography>
      </Grid>
      {/* Settings Dialog Box */}
      {process.env.REACT_APP_REAL_NODE_ENV === 'development' && <LayerModeDialog parent={parent} child={child} />}
      {process.env.REACT_APP_REAL_NODE_ENV === 'local' && <LayerModeDialog parent={parent} child={child} />}
      <ColourDialog parent={parent} child={child} />
      {/* <Grid item xs={2} style={{ position: 'relative' }}>
                  {child.loaded === 100 ? <DoneIcon /> : <div>{getErrorIcon(timeLeft)}</div>}
                        </Grid> */}
    </Grid>
  );
};
