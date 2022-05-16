import React from 'react';
import { Accordion, AccordionSummary, Grid, ListItemIcon, Typography } from '@mui/material';
import { ChildLayer } from './ChildLayer';
import { SortableHandle } from 'react-sortable-hoc';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const ParentLayer = (props: any) => {
  const { parent } = props;
  const [expanded, setExpanded] = React.useState(false);

  const DragHandle = SortableHandle(() => (
    <ListItemIcon>
      <ImportExportIcon />
    </ListItemIcon>
  ));

  return (
    <Accordion
      id="parent-accordion"
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      style={{ width: '100%' }}>
      <Grid
        container
        item
        id="accordion-grid"
        style={{ marginTop: -10, marginBottom: -10 }}
        alignItems="center"
        xs={12}>
        <Grid id="accordion-summary" item xs={10}>
          <AccordionSummary>
            <Typography variant="subtitle1">{parent.name}</Typography>
            <ListItemIcon>{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</ListItemIcon>
          </AccordionSummary>
        </Grid>
        {/* DragHandle */}
        <Grid id="draghandle" item xs={1}>
          <>{/*<DragHandle />}*/}</>
        </Grid>
      </Grid>
      {parent?.children.map((child: any, index) => (
        <ChildLayer key={index} parent={parent} child={child} />
      ))}
    </Accordion>
  );
};
