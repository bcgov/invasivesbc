import { CheckBox, ClassSharp, DirtyLens, StickyNote2 } from '@mui/icons-material';
import { useHistory } from 'react-router';
import CropFreeIcon from '@mui/icons-material/CropFree';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ToggleButton
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import makeStyles from '@mui/styles/makeStyles';
import React, { useContext, useEffect, useState } from 'react';
import ActivitiesList2 from '../../../components/activities-list/NewRecordWizard';

import { alpha } from '@mui/material';
import appTheme from 'themes/appTheme';
import { setOptions } from 'leaflet';
import { useDataAccess } from 'hooks/useDataAccess';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { ClassNames } from '@emotion/react';
import { RecordSet } from './activityRecordset/RecordSet';
interface IStatusPageProps {
  classes?: any;
}

export enum optionType {
  button = 'button',
  toggle = 'toggle'
}
/* unstyled menu - list of buttons that takes an array of options (name, button icons, callback etc) */
export const MenuOptions = (props) => {
  if (props.options == undefined) return <></>;
  const MenuOption = (props) => {
    console.log('option props');
    console.log(props.name);
    const IconFromProps = props.icon;
    switch (props.type) {
      case optionType.toggle:
        return (
          <ToggleButton value={true} color="info">
            {props.name}
          </ToggleButton>
        );
      default:
        return (
          <Button
            size="small"
            color="secondary"
            variant="contained"
            //aria-label="open drawer"
            disabled={props.disabled}
            onClick={props.onClick}
            //  edge="start"
            /*className={clsx(classes.menuButton, {
          [classes.hide]: open
        })}>*/
          >
            <>{props.icon ? <IconFromProps /> : ''} </>
            {props.name}
          </Button>
        );
    }
  };
  console.log('options');
  console.dir(props.options);
  if (props.options !== undefined) {
    return (
      <List sx={{ ...props.sx }}>
        {props.options.map((option) => {
          if (!option.hidden) {
            return (
              <ListItem sx={{ ...props.listSX }}>
                <MenuOption {...option} />
              </ListItem>
            );
          }
        })}
      </List>
    );
  }
};

export default MenuOptions;
