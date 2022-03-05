import React, { useEffect, useContext, useRef } from 'react';
import { DomEvent } from 'leaflet';
import { MapRequestContext } from 'contexts/MapRequestsContext';
/* HelperFiles Parent Layers */
import { sortArray, sortObject } from './Sorting/SortLayerOrder';
/* Helper Files Parent Actions */
import { toolStyles } from '../Tools/Helpers/ToolStyles';
// MUI
import {
  Accordion,
  AccordionSummary,
  Button,
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography
} from '@mui/material';
// MUI Icons
import LayersIcon from '@mui/icons-material/Layers';
import { KMLShapesUpload } from '../../map-buddy-components/KMLShapesUpload';
import SortableListContainer from './Sorting/SortableListContainer';

export const LayerPicker = React.memo(
  (props: any) => {
    const mapLayersContext = useContext(MapRequestContext);
    const { layers, setLayers } = mapLayersContext;
    const toolClass = toolStyles();
    const divref = useRef();

    /* Removed for now:
  function getErrorIcon(time: any) {
    return time === 0 ? <ErrorOutlineIcon /> : <CircularProgress />;
  }

  function WithCounter() {
    const [seconds, setSeconds] = React.useState(10);
    React.useEffect(() => {
      if (seconds > 0) {
        setTimeout(() => setSeconds(seconds - 1), 1000);
      }
    });
    return seconds;
  }*/

    useEffect(() => {
      if (divref?.current) {
        DomEvent.disableClickPropagation(divref?.current);
        DomEvent.disableScrollPropagation(divref?.current);
      }
    }, []);

    const onSortEnd = ({ oldIndex, newIndex }: any) => {
      const returnVal = sortObject(layers, oldIndex, newIndex);
      var len = returnVal.length;
      for (var i = 0; i < len; i++) {
        returnVal[i].zIndex = len * 1000;
        len--;
      }
      setLayers(returnVal);
    };

    const [popoverAnchorEl, setPopoverAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handlePopoverClick = (event: any) => {
      setPopoverAnchorEl(event.currentTarget);
    };
    const handlePopoverClose = () => {
      setPopoverAnchorEl(null);
    };

    const popoverOpen = Boolean(popoverAnchorEl);
    const popoverId = popoverOpen ? 'simple-popover' : undefined;

    return (
      <Box id="el">
        <Popover
          id={popoverId}
          style={{ maxHeight: 500 }}
          open={popoverOpen}
          onClose={handlePopoverClose}
          anchorEl={popoverAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}>
          <SortableListContainer items={sortArray(layers)} onSortEnd={onSortEnd} useDragHandle={true} lockAxis="y" />
          <Button
            id="layer-picker-save-btn"
            onClick={() => {
              localStorage.setItem('mySave', JSON.stringify(layers));
            }}>
            Save
          </Button>
          <Button
            id="layer-picker-load-btn"
            onClick={() => {
              setLayers(JSON.parse(localStorage.getItem('mySave')));
            }}>
            Load
          </Button>
          <Accordion id="admin-shape-upload-accordion">
            <AccordionSummary>Shape Upload (KML/KMZ)</AccordionSummary>
            <KMLShapesUpload />
          </Accordion>
        </Popover>
        <ListItem disableGutters>
          <ListItemButton id="layer-picker-btn" onClick={handlePopoverClick}>
            <ListItemIcon>
              <LayersIcon />
            </ListItemIcon>
            <ListItemText>
              <Typography className={toolClass.Font}>Layer Picker</Typography>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.inputGeo !== nextProps.inputGeo) {
      return false;
    }
    return true;
  }
);
