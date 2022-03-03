import React from 'react';
import { Accordion, AccordionSummary, Grid, ListItemIcon, Typography } from '@mui/material';
import { getParentAction } from '../LayersActionsHelper/LayersActionsFunctions';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { ChildLayer } from './ChildLayer';
import { SortableHandle } from 'react-sortable-hoc';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const ParentLayer = (props: any) => {
  const { parent, onParentLayerAccordionChange } = props;
  const { layersActions } = React.useContext(MapRequestContext);
  const [expanded, setExpanded] = React.useState(false);

  const DragHandle = SortableHandle(() => (
    <ListItemIcon>
      <ImportExportIcon />
    </ListItemIcon>
  ));

  return (
    <Accordion
      id="parent-accordion"
      // expanded={getParentAction(layersActions, parent.id).expanded}
      // onChange={() => setExpanded(!expanded)}
      style={{ width: '100%' }}>
      <Grid id="accordion-grid" container style={{ marginTop: -10, marginBottom: -10 }} alignItems="center" xs={12}>
        <Grid id="accordion-summary" item xs={10}>
          <AccordionSummary>
            <Typography variant="subtitle1">{parent.name}</Typography>
            <ListItemIcon>
              {getParentAction(layersActions, parent.id).expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </ListItemIcon>
          </AccordionSummary>
        </Grid>
        {/* DragHandle */}
        <Grid id="draghandle" item xs={1}>
          <DragHandle />
        </Grid>
      </Grid>
      {parent?.children.map((child: any) => (
        <ChildLayer parent={parent} child={child} />
      ))}
    </Accordion>
  );
};
