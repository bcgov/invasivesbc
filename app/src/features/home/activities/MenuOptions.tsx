import { Button, List, ListItem, ToggleButton } from '@mui/material';
import React from 'react';

export enum optionType {
  button = 'button',
  toggle = 'toggle'
}

/* unstyled menu - list of buttons that takes an array of options (name, button icons, callback etc) */
export const MenuOptions = (props) => {
  if (props.options === undefined) return <></>;
  const MenuOption = (props) => {
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
          <Button size="small" color="secondary" variant="contained" disabled={props.disabled} onClick={props.onClick}>
            <>{props.icon ? <IconFromProps /> : ''} </>
            {props.name}
          </Button>
        );
    }
  };
  if (props.options !== undefined) {
    return (
      <List sx={{ ...props.sx }}>
        {props.options.map((option, i) => {
          if (!option.hidden) {
            return (
              <ListItem key={'menuOption' + i} sx={{ ...props.listSX }}>
                <MenuOption {...option} />
              </ListItem>
            );
          } else return null;
        })}
      </List>
    );
  }
};

export default MenuOptions;
