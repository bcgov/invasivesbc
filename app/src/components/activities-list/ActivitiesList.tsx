import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  SvgIcon
} from '@material-ui/core';
import { Add, Assignment, Build, DeleteForever, SvgIconComponent, Visibility } from '@material-ui/icons';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as RxDB from 'rxdb';

const useStyles = makeStyles((theme) => ({
  subItem: {
    paddingLeft: '32px'
  }
}));

interface IListItem {
  title: string;
  icon: SvgIconComponent;
  url?: string;
  subItems?: IListSubItem[];
}

interface IListSubItem {
  title: string;
  icon: SvgIconComponent;
  url?: string;
}

const newObservation = (): IListSubItem => {
  return {
    title: 'Observation',
    icon: Assignment,
    url: '/activities/observation/id'
  };
};

const newTreatment = (): IListSubItem => {
  return {
    title: 'Treatment',
    icon: Build,
    url: '/activities/treatment/id'
  };
};

const newMonitoring = (): IListSubItem => {
  return {
    title: 'Monitoring',
    icon: Visibility,
    url: '/activities/monitoring/id'
  };
};

const basicListItems: IListItem[] = [
  {
    title: 'Observation',
    url: '/activities/:id/observation',
    icon: Add,
    subItems: []
  },
  {
    title: 'Treatment',
    url: '/activities/:id/treatment',
    icon: Add,
    subItems: []
  },
  {
    title: 'Monitoring',
    url: '/activities/:id/monitoring',
    icon: Add,
    subItems: []
  }
  // {
  //   title: 'Photo Gallery',
  //   url: '/activities/photo',
  //   icon: Photo
  // },
  // {
  //   title: 'Map',
  //   url: '/activities/map',
  //   icon: Map
  // }
];

const ActivitiesList: React.FC = (props) => {
  const classes = useStyles();

  const database: RxDB.RxDatabase = useContext(DatabaseContext);

  const history = useHistory();

  const [listItems, setListItems] = useState<IListItem[]>(basicListItems);

  // useEffect(() => {
  //   database.collections();
  // }, [database]);

  const addNewForm = (listItemIndex: number) => {
    return setListItems((listItems) => {
      const listItemsCopy = [...listItems];

      let newSubItem = null;
      switch (listItems[listItemIndex].title) {
        case 'Observation':
          newSubItem = newObservation();
          break;
        case 'Treatment':
          newSubItem = newTreatment();
          break;
        case 'Monitoring':
          newSubItem = newMonitoring();
          break;
      }
      listItemsCopy[listItemIndex].subItems.push(newSubItem);

      return listItemsCopy;
    });
  };

  const removeForm = (listItemIndex: number, subItemIndex: number) => {
    return setListItems((listItems) => {
      const listItemsCopy = [...listItems];

      listItemsCopy[listItemIndex].subItems.splice(subItemIndex, 1);

      return listItemsCopy;
    });
  };

  return (
    <List>
      {listItems.map((listItem, listItemIndex) => {
        return (
          <>
            <ListItem button key={listItem.title} onClick={() => addNewForm(listItemIndex)}>
              <ListItemIcon>
                <SvgIcon component={listItem.icon} />
              </ListItemIcon>
              <ListItemText>{listItem.title}</ListItemText>
            </ListItem>
            {listItem.subItems.map((subItem, subItemIndex) => {
              return (
                <List component="div" disablePadding>
                  <ListItem button key={subItem.url} className={classes.subItem}>
                    <ListItemIcon>
                      <SvgIcon component={subItem.icon} />
                    </ListItemIcon>
                    <ListItemText>{subItem.title}</ListItemText>
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeForm(listItemIndex, subItemIndex)}>
                        <DeleteForever />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              );
            })}
          </>
        );
      })}
    </List>
  );
};

export default ActivitiesList;
