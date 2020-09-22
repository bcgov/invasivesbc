import { v4 as uuidv4 } from 'uuid';
import {
  Button,
  Divider,
  Grid,
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
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PouchDB from 'pouchdb-core';

const useStyles = makeStyles((theme) => ({
  subItem: {
    paddingLeft: '32px'
  },
  activitiyListItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  activitiyListCol: {
    flex: '1'
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

interface IActivitiesList {
  Observations: any[];
  Treatments: any[];
  Monitorings: any[];
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
}

// const basicListItems: IListItem[] = [
//   {
//     title: 'Observation',
//     url: '/activities/:id/observation',
//     icon: Add,
//     subItems: []
//   },
//   {
//     title: 'Treatment',
//     url: '/activities/:id/treatment',
//     icon: Add,
//     subItems: []
//   },
//   {
//     title: 'Monitoring',
//     url: '/activities/:id/monitoring',
//     icon: Add,
//     subItems: []
//   }
//   // {
//   //   title: 'Photo Gallery',
//   //   url: '/activities/photo',
//   //   icon: Photo
//   // },
//   // {
//   //   title: 'Map',
//   //   url: '/activities/map',
//   //   icon: Map
//   // }
// ];

// TODO change any to a type that defines the overall items being displayed
const ActivityList: React.FC<any> = (props) => {
  const database = useContext(DatabaseContext);

  useEffect(() => {
    if (!database) {
      return;
    }

    const updateActivityList = async () => {
      const allDocs = await database.allDocs({
        include_docs: true,
        attachments: true
      });

      database.find({
        selector: { type: 'Observation' }
      });
    };

    updateActivityList();
  }, [database]);

  const removeActivity = async (doc: PouchDB.Core.RemoveDocument) => {
    database.remove(doc);
  };

  return (
    <List>
      {props?.items.map((subItem, subItemIndex) => {
        return (
          <ListItem button key={subItem.url} className={props?.classes.subItem}>
            <ListItemIcon>
              <SvgIcon component={subItem.icon} />
            </ListItemIcon>
            <ListItemText>
              <ActivityListItem {...subItem} />
            </ListItemText>
            <ListItemSecondaryAction>
              <IconButton onClick={() => removeActivity(doc)}>
                <DeleteForever />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

const ActivityListItem: React.FC<IListSubItem> = (props) => {
  const classes = useStyles();

  return (
    <Grid container direction="row" spacing={2}>
      <Grid item>{props.title}</Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item>{props.url}</Grid>
    </Grid>
  );
};

const ActivitiesList: React.FC = (props) => {
  const classes = useStyles();

  const database = useContext(DatabaseContext);

  const history = useHistory();

  const [listItems, setListItems] = useState<IActivitiesList>({ Observations: [], Treatments: [], Monitorings: [] });

  // useEffect(() => {
  //   if (!database) {
  //     return;
  //   }

  //   const updateActivityLists = async () => {
  //     const allDocs = await database.allDocs({
  //       include_docs: true
  //     });
  //   };

  //   updateActivityLists();
  // }, [database]);

  // const addNewForm = (listItemIndex: number) => {
  //   return setListItems((listItems) => {
  //     const listItemsCopy = [...listItems];

  //     let newSubItem = null;
  //     switch (listItems[listItemIndex].title) {
  //       case 'Observation':
  //         newSubItem = newObservation();
  //         break;
  //       case 'Treatment':
  //         newSubItem = newTreatment();
  //         break;
  //       case 'Monitoring':
  //         newSubItem = newMonitoring();
  //         break;
  //     }
  //     listItemsCopy[listItemIndex].subItems.push(newSubItem);

  //     return listItemsCopy;
  //   });
  // };

  const addNewActivity = async (activityType: string) => {
    database.put({
      _id: uuidv4(),
      type: activityType,
      status: 'new',
      sync: {
        status: false,
        error: null
      },
      dateCreated: new Date(),
      dateUpated: null
    });
  };

  // const removeForm = (listItemIndex: number, subItemIndex: number) => {
  //   return setListItems((listItems) => {
  //     const listItemsCopy = [...listItems];

  //     listItemsCopy[listItemIndex].subItems.splice(subItemIndex, 1);

  //     return listItemsCopy;
  //   });
  // };

  return (
    <>
      <div>
        <Button variant="contained" startIcon={<Add />} onClick={() => addNewActivity('Observation')}>
          Add New Observation
        </Button>
        <ActivityList type="Observation" />
      </div>
      <div>
        <Button variant="contained" startIcon={<Add />} onClick={() => addNewActivity('Treatment')}>
          Add New Treatment
        </Button>
        <ActivityList type="Treatment" />
      </div>
      <div>
        <Button variant="contained" startIcon={<Add />} onClick={() => addNewActivity('Monitoring')}>
          Add New Monitoring
        </Button>
        <ActivityList type="Monitoring" />
      </div>
    </>
  );

  // return (
  //   <List>
  //     {listItems.map((listItem, listItemIndex) => {
  //       return (
  //         <>
  //           <ListItem button key={listItem.title} onClick={() => addNewForm(listItemIndex)}>
  //             <ListItemIcon>
  //               <SvgIcon component={listItem.icon} />
  //             </ListItemIcon>
  //             <ListItemText>{listItem.title}</ListItemText>
  //           </ListItem>
  //           {listItem.subItems.map((subItem, subItemIndex) => {
  //             return (
  //               <List component="div" disablePadding>
  //                 <ListItem button key={subItem.url} className={classes.subItem}>
  //                   <ListItemIcon>
  //                     <SvgIcon component={subItem.icon} />
  //                   </ListItemIcon>
  //                   <ListItemText>
  //                     <ActivityListItem {...subItem} />
  //                   </ListItemText>
  //                   <ListItemSecondaryAction>
  //                     <IconButton onClick={() => removeForm(listItemIndex, subItemIndex)}>
  //                       <DeleteForever />
  //                     </IconButton>
  //                   </ListItemSecondaryAction>
  //                 </ListItem>
  //               </List>
  //             );
  //           })}
  //         </>
  //       );
  //     })}
  //   </List>
  // );
};

export default ActivitiesList;
