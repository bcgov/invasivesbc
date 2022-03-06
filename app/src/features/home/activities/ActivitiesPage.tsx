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
import ActivitiesList2 from '../../../components/activities-list/ActivitiesList2';

import { alpha } from '@mui/material';
import appTheme from 'themes/appTheme';
import { setOptions } from 'leaflet';
import { useDataAccess } from 'hooks/useDataAccess';
import { DatabaseContext } from 'contexts/DatabaseContext';
interface IStatusPageProps {
  classes?: any;
}
const flexContainer = {
  display: 'flex',
  flexDirection: 'row',
  padding: 0
};

enum optionType {
  button = 'button',
  toggle = 'toggle'
}

const TabOptions = (props) => {
  if (props.options == undefined) return <></>;
  const TabOption = (props) => {
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
      <List sx={flexContainer}>
        {props.options.map((option) => {
          if (!option.hidden) {
            return (
              <ListItem>
                <TabOption {...option} />
              </ListItem>
            );
          }
        })}
      </List>
    );
  }
};

const useStyles = makeStyles((theme: any) => ({
  newActivityButtonsRow: {
    '& Button': {
      marginRight: '0.5rem',
      marginBottom: '0.5rem'
    }
  },
  syncSuccessful: {
    color: theme.palette.success.main
  },
  formControl: {},
  mainHeader: {
    backGroundColor: theme.palette.success.main
  }
}));

const RecordSet = (props) => {
  return (
    <>
      <Accordion>
        <AccordionSummary>
          {props.name}
          <AccordionActions>
            <Button variant="contained">Remove X</Button>
            <Button style={{ backgroundColor: alpha('#FFF', 0) }} variant="contained">
              Map Colour
            </Button>
            Snap to map<CheckBox>Snap to map</CheckBox>
          </AccordionActions>
        </AccordionSummary>
        <AccordionDetails>
          <ActivitiesList2 setSelectedRecord={props.setSelectedRecord} />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

//Style:  I tried to use className: mainHeader and put css in that class but never coloured the box
const ActivitiesPage: React.FC<IStatusPageProps> = (props) => {
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  const classes = useStyles();
  const [selectedRecord, setSelectedRecord] = useState<any>({});
  const [options, setOptions] = useState<any>();
  const history = useHistory();

  useEffect(() => {
    setOptions([
      {
        name: 'Toggle Filters on Map',
        hidden: false,
        disabled: false,
        //type: optionType.toggle,
        onClick: () => {
          alert('no');
        },
        icon: (props) => {
          return (
            <>
              <FilterListIcon />
              <MapIcon />
            </>
          );
        }
      },
      {
        name: 'Current window only',
        hidden: false,
        disabled: false,
        icon: (props) => {
          return (
            <>
              <FilterListIcon />
              <CropFreeIcon />
            </>
          );
        },
        onClick: () => {
          alert('no');
        }
      },
      {
        name: 'New Record',
        hidden: false,
        disabled: false,
        onClick: () => {
          alert('no');
        }
      },
      {
        name: 'Open' + (selectedRecord?.description !== undefined ? selectedRecord?.description : ''),
        disabled: !(selectedRecord?.description !== undefined),
        hidden: !selectedRecord,
        onClick: async () => {
          try {
            await dataAccess.setAppState({ activeActivity: selectedRecord.id }, databaseContext);
          } catch (e) {
            console.log('unable to http ');
            console.log(e);
          }
          //return dbActivity.activity_id;
          setTimeout(() => {
            history.push({ pathname: `/home/activity` });
          }, 1000);
        }
      }
    ]);
    console.log('selected');
  }, [selectedRecord]);

  return (
    <>
      <Box
        style={{
          position: 'absolute',
          zIndex: 9999,
          backgroundColor: '#223f75',
          width: '100%',
          height: '80px'
        }}>
        <TabOptions options={options} />
      </Box>
      <Box style={{ position: 'relative', backgroundColor: '#223f75', width: '100%', height: '80px' }}></Box>
      <Container maxWidth={false} style={{ maxHeight: '100%' }} className={props.classes.container}>
        <Grid container xs={12} height="50px" display="flex" justifyContent="left">
          <Grid sx={{ pb: 15 }} xs={12} item>
            <RecordSet canRemove={false} setSelectedRecord={setSelectedRecord} name={'My Drafts'} />
            <RecordSet canRemove={false} setSelectedRecord={setSelectedRecord} name={'All Data'} />
          </Grid>
          <Grid sx={{ pb: 15 }} xs={12} item>
            <Button style={{ width: '100%' }} variant="contained">
              New Record Set
            </Button>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ActivitiesPage;
